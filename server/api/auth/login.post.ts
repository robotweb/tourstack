import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  const config = useRuntimeConfig()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Prepare StackAuth API request
  const apiUrl = config.public.stackApiUrl
  const payload = {
    email: email,
    password: password,
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Stack-Access-Type': 'client',
    'X-Stack-Project-Id': config.public.stackProjectId,
    'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
  }
  
  try {
    console.log('🔑 Server: Attempting StackAuth sign-in')
    console.log('🔑 Server: API URL:', apiUrl)
    console.log('🔑 Server: Project ID:', config.public.stackProjectId)
    console.log('🔑 Server: Payload:', payload)
    console.log('🔑 Server: Headers:', headers)
    
    const response = await $fetch<{ access_token: string; refresh_token: string; user_id: string }>(`${apiUrl}/api/v1/auth/password/sign-in`, {
      method: 'POST',
      body: payload,
      headers: headers,
    })

    console.log('✅ StackAuth sign-in response:', {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      hasUserId: !!response.user_id,
      responseKeys: Object.keys(response),
      fullResponse: response
    })

    if (!response.access_token) {
      return { error: 'Authentication failed: No token returned' }
    }

    // set jwt and refresh token in cookies
    setCookie(event, 'access_token', response.access_token)
    setCookie(event, 'refresh_token', response.refresh_token)

    return { access_token: response.access_token, refresh_token: response.refresh_token, user_id: response.user_id }
  } catch (err: any) {
    console.error('❌ StackAuth sign-in failed:', {
      message: err instanceof Error ? err.message : String(err),
      status: err?.status,
      statusCode: err?.statusCode,
      statusText: err?.statusText,
      data: err?.data,
      response: err?.response,
      url: err?.url,
      stack: err?.stack
    })
    return { error: 'Invalid credentials' }
  }
}) 