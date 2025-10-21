import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { id: string; display_name: string }
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async validateToken(token: string | null, skipRefresh = false): Promise<boolean> {
        // console.log('🔑 Validating token:', token)
      try {
        const response = await $fetch<{ id: string, display_name: string }>('/api/auth/me', {
          method: 'GET',
          query: {
            access_token: token,
          },
        })
        // console.log('🔑 Token validation response:', response)
        if ('id' in response && response.id) {
        //   console.log('✅ JWT token validation successful - user ID in response:', response.id)
          this.user = response
          return true
        }
        console.log('❌ JWT token validation failed - no user ID in response')
        
        // Only try to refresh if not already in a refresh attempt
        if (!skipRefresh) {
          const refreshTokenCookie = useCookie('refresh_token').value
          if(refreshTokenCookie) {
            const refreshSuccess = await this.refreshToken(refreshTokenCookie)
            console.log('🔑 Refresh success:', refreshSuccess)
            if (refreshSuccess) {
              // After successful refresh, validate the new token
              const newToken = useCookie('access_token').value
              return await this.validateToken(newToken || null, true) // Skip refresh to avoid infinite loop
            }
          }
        }
        return false
      } catch (error: any) {
        console.error('❌ JWT validation failed:', {
          message: error instanceof Error ? error.message : String(error),
          status: error?.status,
          statusCode: error?.statusCode,
          statusText: error?.statusText,
          data: error?.data,
          response: error?.response,
          url: error?.url,
          stack: error?.stack
        })
        return false
      }
    },

    async refreshToken(refreshToken: string) {
      try {
        console.log('🔑 Refreshing JWT token...')
        const response = await $fetch<{ access_token?: string}>('/api/auth/refresh', {
          method: 'POST',
          body: {
            refresh_token: refreshToken,
          },
        })
        
        if ('access_token' in response && response.access_token) {
          console.log('✅ Token refreshed successfully!')
          // Update the access token cookie with the new token
          useCookie('access_token').value = response.access_token
          return true
        }
        console.log('❌ No access token in refresh response:', response)
        return false
      } catch (error) {
        console.error('❌ Token refresh failed:', {
          message: error instanceof Error ? error.message : String(error),
          status: (error as any)?.status,
          statusCode: (error as any)?.statusCode,
          statusText: (error as any)?.statusText,
          data: (error as any)?.data,
          response: (error as any)?.response,
          url: (error as any)?.url,
          stack: (error as any)?.stack
        })
        return false
      }
    },

    async fetchUser() {
      console.log('🔧 Fetching user...')
      const accessToken = useCookie('access_token').value || null
      const refreshToken = useCookie('refresh_token').value || null

    //   console.log('🔧 Access token:', accessToken)
    //   console.log('🔧 Refresh token:', refreshToken)

      if (!accessToken && !refreshToken) {
        console.log('🔧 No tokens available')
        return null
      }

      // First try with current access token
      const user = await this.validateToken(accessToken)
    //   console.log('🔧 User:', user)
      if (!user) {
        console.log('🔧 Token is invalid')
        return null
      }
      if (this.user?.id) {
        const dbUser = await this.getDbUser(this.user?.id)
      }
      
      return this.user
    },

    async getDbUser(authstackuid: string) {
        // console.log('🔧 Getting db user:', authstackuid)
      // fetch user from db. if user does not exist, create it
      try {
        const user = await $fetch<{ error?: string } | any>('/api/auth/user', {
          method: 'GET',
          query: {
            userid: authstackuid,
          },
        })

        if ('error' in user && user.error) {
          // User doesn't exist, but we don't have enough data to create one
          // This is expected for new users - they'll be created when they first access the app
          console.log('🔧 User not found in database, will be created on first access')
          return null
        }
        return user
      } catch (error: any) {
        console.error('❌ Database error in getDbUser:', {
          message: error instanceof Error ? error.message : String(error),
          status: error?.status,
          statusCode: error?.statusCode,
          statusText: error?.statusText,
          data: error?.data,
          response: error?.response,
          url: error?.url,
          stack: error?.stack
        })
        
        // For any database error, sign out the user
        this.logout()
        throw new Error('Database connection failed')
      }
    },

    async login(email: string, password: string) {
      try {
        console.log('🔑 Logging in...', email, password)
        const response = await $fetch<{ access_token: string, refresh_token: string, user_id: string, error?: string }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        
        if (response.access_token && response.refresh_token) {
          // Store tokens in cookies
          useCookie('access_token').value = response.access_token
          useCookie('refresh_token').value = response.refresh_token
          
          console.log('✅ Tokens saved to cookies')
          
          // Fetch user data to populate auth store
          console.log('🔧 Fetching user data after login...')
          const user = await this.fetchUser()
          console.log('🔧 User fetched:', user)
          
          return { success: true }
        } else {
          return { success: false, error: response.error || 'Invalid credentials' }
        }
      } catch (error: any) {
        console.error('❌ Login error:', {
          message: error instanceof Error ? error.message : String(error),
          status: error?.status,
          statusCode: error?.statusCode,
          statusText: error?.statusText,
          data: error?.data,
          response: error?.response,
          url: error?.url,
          stack: error?.stack
        })
        return { success: false, error: 'Login failed. Please try again.' }
      }
    },

    async signup(email: string, password: string, name?: string) {
      try {
        console.log('🔑 Signing up...', email, password, name)
        const response = await $fetch<{ access_token: string, refresh_token: string, user_id: string, error?: string }>('/api/auth/signup', {
          method: 'POST',
          body: { email, password, name },
        })
        
        if (response.access_token && response.refresh_token) {
          // Store tokens in cookies
          useCookie('access_token').value = response.access_token
          useCookie('refresh_token').value = response.refresh_token
          
          console.log('✅ Tokens saved to cookies')
          
          // Fetch user data to populate auth store
          await this.fetchUser()
          
          return { success: true }
        } else {
          return { success: false, error: response.error || 'Invalid credentials' }
        }
      } catch (error: any) {
        console.error('❌ Signup error:', {
          message: error instanceof Error ? error.message : String(error),
          status: error?.status,
          statusCode: error?.statusCode,
          statusText: error?.statusText,
          data: error?.data,
          response: error?.response,
          url: error?.url,
          stack: error?.stack
        })
        return { success: false, error: 'Signup failed. Please try again.' }
      }
    },

    logout() {
      useCookie('access_token').value = null
      useCookie('refresh_token').value = null
      console.log('🔧 Logged out')
      this.user = null
    },

    async checkAuth() {
      console.log('🔧 Checking authentication...')
      const accessToken = useCookie('access_token').value
      const refreshToken = useCookie('refresh_token').value

      // If no tokens at all, user is not authenticated
      if (!accessToken && !refreshToken) {
        console.log('🔧 No tokens available')
        return false
      }

      // If we have a user in store, validate the token is still valid
      if (this.user) {
        try {
          const isValid = await this.validateToken(accessToken || null)
          if (isValid) {
            return true
          }
          // Token is invalid, try to refresh
          if (refreshToken) {
            const refreshSuccess = await this.refreshToken(refreshToken)
            if (refreshSuccess) {
              return true
            }
          }
          // Refresh failed, logout and return false
          this.logout()
          return false
        } catch (error: any) {
          console.error('❌ Token validation error:', {
            message: error instanceof Error ? error.message : String(error),
            status: error?.status,
            statusCode: error?.statusCode,
            statusText: error?.statusText,
            data: error?.data,
            response: error?.response,
            url: error?.url,
            stack: error?.stack
          })
          // Check if it's a database connection error
          if (error?.message === 'Database connection failed') {
            throw error // Re-throw database errors for special handling
          }
          // For other errors, try to refresh token
          if (refreshToken) {
            try {
              const refreshSuccess = await this.refreshToken(refreshToken)
              if (refreshSuccess) {
                return true
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', {
                message: refreshError instanceof Error ? refreshError.message : String(refreshError),
                status: (refreshError as any)?.status,
                statusCode: (refreshError as any)?.statusCode,
                statusText: (refreshError as any)?.statusText,
                data: (refreshError as any)?.data,
                response: (refreshError as any)?.response,
                url: (refreshError as any)?.url,
                stack: (refreshError as any)?.stack
              })
            }
          }
          this.logout()
          return false
        }
      } else {
        // No user in store, try to fetch user
        try {
          const user = await this.fetchUser()
          return !!user
        } catch (error: any) {
          console.error('❌ Fetch user error:', {
            message: error instanceof Error ? error.message : String(error),
            status: error?.status,
            statusCode: error?.statusCode,
            statusText: error?.statusText,
            data: error?.data,
            response: error?.response,
            url: error?.url,
            stack: error?.stack
          })
          // Check if it's a database connection error
          if (error?.message === 'Database connection failed') {
            throw error // Re-throw database errors for special handling
          }
          return false
        }
      }
    }
  }
})