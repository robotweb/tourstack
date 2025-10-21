import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}
  const config = useRuntimeConfig()
  console.log('➡️  POST /api/auth/verify-email called', { hasCode: Boolean(code) })

  if (!code) {
    console.error('❌ POST /api/auth/verify-email: Missing code')
    return { status: 400, body: { error: 'Verification code is required' } }
  }

  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    console.error('❌ POST /api/auth/verify-email: StackAuth not configured properly')
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

    const response = await $fetch(`${apiUrl}/api/v1/contact-channels/verify`, {
      method: 'POST',
      headers,
      body: { code }
    })
    console.log('✅ Server: Email verification success')
    return { success: true, message: (response as any)?.message || 'Email verified' }
  } catch (error: any) {
    console.error('❌ Server: StackAuth email verification failed:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      data: error?.data,
      response: error?.response
    })

    return { status: error?.statusCode || 500, body: { error: 'Email verification failed' } }
  }
})


