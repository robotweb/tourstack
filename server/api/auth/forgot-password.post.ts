import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body
  const config = useRuntimeConfig()

  if (!email) {
    console.error('❌ POST /api/auth/forgot-password: Missing email')
    return { status: 400, body: { error: 'Email is required' } }
  }

  // Check if StackAuth is properly configured
  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    console.error('❌ POST /api/auth/forgot-password: StackAuth not configured properly')
    return { status: 500, body: { error: 'Authentication service not configured' } }
  }

  try {
    console.log('🔑 Server: Sending password reset code for:', email)
    
    // Prepare StackAuth API request
    const apiUrl = config.public.stackApiUrl
    const headers = {
      'Content-Type': 'application/json',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': config.public.stackProjectId,
      'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
    }

    const response = await $fetch<{ message: string }>(`${apiUrl}/api/v1/auth/password/send-reset-code`, {
      method: 'POST',
      headers: headers,
      body: {
        email: email,
        callback_url: `${config.public.hostname}/handler/reset-password`,
      }
    })

    console.log('✅ Server: Password reset code sent successfully')
    return { message: 'Password reset code sent to your email' }
  } catch (error: any) {
    console.error('❌ Server: StackAuth password reset request failed:', {
      message: error.message,
      status: error?.status,
      statusCode: error?.statusCode,
      data: error?.data,
      response: error?.response
    })
    
    // Return generic error message for security (don't reveal if email exists)
    return { status: 500, body: { error: 'Failed to send password reset code' } }
  }
})
