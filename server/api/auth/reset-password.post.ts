import { defineEventHandler, readBody, createError, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string; password?: string }>(event)
  const { code, password } = body || {}
  const config = useRuntimeConfig()

  console.log('➡️  POST /api/auth/reset-password called', { hasCode: Boolean(code), hasPassword: Boolean(password) })

  if (!code || !password) {
    console.error('❌ POST /api/auth/reset-password: Missing code or password')
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { error: 'Code and password are required' } })
  }

  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    console.error('❌ POST /api/auth/reset-password: StackAuth not configured properly')
    throw createError({ statusCode: 500, statusMessage: 'Server Misconfiguration', data: { error: 'Authentication service not configured' } })
  }

  try {
    const apiUrl = config.public.stackApiUrl
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': config.public.stackProjectId,
      'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
    }

    // If user is logged in, forward Authorization header as well
    const accessToken = getCookie(event, 'access_token')
    const refreshToken = getCookie(event, 'refresh_token')
    if (accessToken) {
      headers['X-Stack-Access-Token'] = accessToken
    }

    const response = await $fetch<any>(`${apiUrl}/api/v1/auth/password/reset`, {
      method: 'POST',
      headers,
      // StackAuth expects exactly: { code, password }
      body: { code, password }
    })
    console.log('✅ Server: Password reset success', { response })
    return { success: true, message: response?.message || 'Password reset', data: response }
  } catch (error: any) {
    console.error('❌ Server: StackAuth password reset failed:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      data: error?.data,
      response: error?.response
    })
    const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to reset password'
    throw createError({ statusCode: error?.statusCode || 500, statusMessage: 'Reset Failed', data: { error: errorMessage } })
  }
})
