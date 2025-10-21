import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {

  const config = useRuntimeConfig()
  const params = getQuery(event)
  const accessToken = typeof params.access_token === 'string' ? params.access_token : ''

  // Prepare StackAuth API request
  const apiUrl = config.public.stackApiUrl

  const headers = {
    'Content-Type': 'application/json',
    'X-Stack-Access-Type': 'client',
    'X-Stack-Project-Id': config.public.stackProjectId,
    'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
    'X-Stack-Access-Token': accessToken,
  }
  
  try {
    console.log('🔑 Server: Attempting to get user info from StackAuth')
    console.log('🔑 Server: Access token:', accessToken ? 'present' : 'missing')
    console.log('🔑 Server: Headers:', headers)
    
    const response = await $fetch<{ id: string; email: string; name?: string }>(`${apiUrl}/api/v1/users/me`, {
      method: 'GET',
      headers: headers,
    })

    console.log('✅ StackAuth user info response:', {
      hasId: !!response.id,
      hasEmail: !!response.email,
      responseKeys: Object.keys(response),
      fullResponse: response
    })

    if (!response.id) {
      return { error: 'Authentication failed: No user id returned' }
    }

    return response


  } catch (err: any) {
    console.error('❌ StackAuth user info failed:', {
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