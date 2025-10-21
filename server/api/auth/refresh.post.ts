import { defineEventHandler, readBody, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get refresh token from request body
  const body = await readBody(event)
  const refreshToken = body.refresh_token as string

  if (!refreshToken) {
    return { error: 'No refresh token provided' }
  }

  // Check if StackAuth is properly configured
  if (!config.public.stackApiUrl || !config.public.stackProjectId || !config.public.stackPublishableClientKey) {
    console.error('❌ Server: StackAuth not configured properly')
    return { error: 'Authentication service not configured' }
  }

  // Prepare StackAuth API request
  const apiUrl = config.public.stackApiUrl

  const headers = {
    'Content-Type': 'application/json',
    'X-Stack-Access-Type': 'client',
    'X-Stack-Project-Id': config.public.stackProjectId,
    'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
    'X-Stack-Refresh-Token': refreshToken,
  }
  
  try {
    console.log('🔑 Server: Attempting StackAuth token refresh')
    console.log('🔑 Server: API URL:', apiUrl)
    console.log('🔑 Server: Project ID:', config.public.stackProjectId)
    console.log('🔑 Server: Headers:', headers)
    
    const response = await $fetch<{ access_token: string}>(`${apiUrl}/api/v1/auth/sessions/current/refresh`, {
      method: 'POST',
      headers: headers,
      body: {
        'X-Stack-Refresh-Token': refreshToken,
      },
    })

    // console.log('🔑 Server: StackAuth refresh response received:', {
    //   hasAccessToken: !!response.access_token,
    //   responseKeys: Object.keys(response)
    // })

    if (!response.access_token) {
      console.error('❌ Server: No access token returned from StackAuth refresh endpoint:', response)
      return { error: 'Authentication failed: No access token returned' }
    }

    console.log('✅ Server: StackAuth token refresh successful')
    return { access_token: response.access_token }

  } catch (err) {
    console.error('❌ Server: StackAuth refresh token error:', {
      message: err instanceof Error ? err.message : String(err),
      status: (err as any)?.status,
      statusCode: (err as any)?.statusCode,
      statusText: (err as any)?.statusText,
      data: (err as any)?.data,
      response: (err as any)?.response,
      url: (err as any)?.url,
      stack: (err as any)?.stack
    })
    return { error: 'Invalid credentials', error_message: err }
  }
})
