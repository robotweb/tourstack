import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}
  const config = useRuntimeConfig()

  console.log('➡️  POST /api/auth/check-verify-password-code called', { hasCode: Boolean(code) })

  if (!code) {
    console.error('❌ POST /api/auth/check-verify-password-code: Missing code')
    return { status: 400, body: { error: 'Reset code is required' } }
  }

  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    console.error('❌ POST /api/auth/check-verify-password-code: StackAuth not configured properly')
    return { status: 500, body: { error: 'Authentication service not configured' } }
  }

  try {
    const apiUrl = config.public.stackApiUrl
    const headers = {
      'Content-Type': 'application/json',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': config.public.stackProjectId,
      'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
    }

    const response = await $fetch<{ is_valid?: boolean; message?: string }>(`${apiUrl}/api/v1/auth/password/reset/check-code`, {
      method: 'POST',
      headers,
      body: { code }
    })

    console.log('✅ Server: Password reset code check success')
    return { success: true, ...response }
  } catch (error: any) {
    console.error('❌ Server: StackAuth check reset code failed:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      data: error?.data,
      response: error?.response
    })

    return { status: error?.statusCode || 500, body: { error: 'Invalid or expired reset code' } }
  }
})


