import { defineNuxtPlugin } from '#app'

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const API_URL = config.public.API_URL;

  const getStoredTokens = () => {
    const accessToken = useCookie('access_token').value
    const refreshToken = useCookie('refresh_token').value
    console.log('Stored tokens - Access:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null')
    console.log('Stored tokens - Refresh:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null')
    return { accessToken, refreshToken }
  }

  const setStoredTokens = (tokens: TokenResponse) => {
    console.log('setStoredTokens called with:', tokens)
    console.log('Setting access_token:', tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'null')
    console.log('Setting refresh_token:', tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'null')
    
    const accessTokenCookie = useCookie('access_token')
    accessTokenCookie.value = tokens.access_token

    const refreshTokenCookie = useCookie('refresh_token')
    refreshTokenCookie.value = tokens.refresh_token
    
    console.log('Cookies after setStoredTokens - Access:', accessTokenCookie.value ? `${accessTokenCookie.value.substring(0, 20)}...` : 'null')
    console.log('Cookies after setStoredTokens - Refresh:', refreshTokenCookie.value ? `${refreshTokenCookie.value.substring(0, 20)}...` : 'null')
  }

  const clearStoredTokens = () => {
    const accessTokenCookie = useCookie('access_token')
    accessTokenCookie.value = null

    const refreshTokenCookie = useCookie('refresh_token')
    refreshTokenCookie.value = null
  }

  const refreshTokens = async (): Promise<TokenResponse | null> => {
    const { refreshToken } = getStoredTokens()
    if (!refreshToken) {
      console.log('No refresh token available')
      return null
    }

    try {
      console.log('Attempting to refresh tokens...')
      const tokens = await $fetch<TokenResponse>(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { refresh_token: refreshToken },
      })
      console.log(tokens)
      console.log('Tokens refreshed successfully')
      setStoredTokens(tokens)
      return tokens
    } catch (error: any) {
      console.log('Token refresh failed:', error)
      clearStoredTokens()
      return null
    }
  }

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const { accessToken } = getStoredTokens()
    let headers = new Headers(init?.headers)

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const url = typeof input === 'string' ? input : input.toString();

    const method = init?.method?.toUpperCase() as
      | "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE"
      | undefined;

    try {
      // $fetch will throw on non-2xx responses
      return await $fetch(url, {
        ...init,
        method,
        headers,
      })
    } catch (error: any) {
      console.log('AuthFetch Error:', error)
      
      // Check for 401 status - handle different error structures
      const status = error?.response?.status || error?.status || error?.statusCode
      console.log('Error status:', status)
      
      // If we get a 401 and we have a refresh token, try to refresh
      if (status === 401) {
        console.log('401 Unauthorized detected, attempting token refresh...')
        const newTokens = await refreshTokens()
        if (newTokens) {
          console.log('Token refresh successful, retrying original request...')
          headers.set('Authorization', `Bearer ${newTokens.access_token}`)
          // Retry the original request with the new token
          return await $fetch(url, {
            ...init,
            method,
            headers,
          })
        } else {
          console.log('Token refresh failed. Logging out and redirecting to login...');
          
          // Explicitly clear tokens to ensure logout
          clearStoredTokens();

          // Redirect to the login page
          await navigateTo('/login');

          // Throw a new error to stop further execution and inform the caller
          throw new Error('Your session has expired. Please log in again.');
        }
      }
      
      // Extract error message from the response
      let errorMessage = "Request failed"
      let errorDetails = {}
      
      if (error.data && error.data.error) {
        // Error from our backend
        errorDetails = error.data.error
        if (error.data.error.error) {
          errorMessage = error.data.error.error
        } else if (error.data.error.message) {
          errorMessage = error.data.error.message
        }
      } else if (error.message) {
        // Generic error message
        errorMessage = error.message
      }
      
      // Add extracted error information to the error object
      error.userMessage = errorMessage
      error.errorDetails = errorDetails
      error.originalData = error.data
      
      // Rethrow the enhanced error
      throw error
    }
  }

  return {
    provide: {
      authFetch,
      setStoredTokens,
    },
  }
}) 