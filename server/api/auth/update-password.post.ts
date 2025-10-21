import { defineEventHandler, readBody, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ old_password?: string; new_password?: string }>(event)
  const { old_password, new_password } = body || {}
  const config = useRuntimeConfig()

  console.log('➡️  POST /api/auth/update-password called', { hasOld: Boolean(old_password), hasNew: Boolean(new_password) })

  if (!old_password || !new_password) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { error: 'old_password and new_password are required' } })
  }

  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server Misconfiguration', data: { error: 'Authentication service not configured' } })
  }

  // Read access token from cookies (user must be logged in)
  const accessToken = getCookie(event, 'access_token')
  const refreshToken = getCookie(event, 'refresh_token')
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { error: 'Missing access token' } })
  }
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { error: 'Missing refresh token' } })
  }

  try {
    const apiUrl = config.public.stackApiUrl
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': config.public.stackProjectId,
      'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
      'X-Stack-Access-Token': accessToken,
      'X-Stack-Refresh-Token': refreshToken,
    }

    const response = await $fetch<any>(`${apiUrl}/api/v1/auth/password/update`, {
      method: 'POST',
      headers,
      body: { old_password, new_password }
    })

    console.log('✅ Server: Password update success', { response })
    return { success: true, message: response?.message || 'Password updated' }
  } catch (error: any) {
    console.error('❌ Server: StackAuth password update failed:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      data: error?.data,
      response: error?.response
    })
    const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to update password'
    throw createError({ statusCode: error?.statusCode || 500, statusMessage: 'Update Failed', data: { error: errorMessage } })
  }
})


