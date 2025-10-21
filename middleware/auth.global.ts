export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  
  // Allow all handler routes without authentication
  if (to.path.startsWith('/handler')) {
    return
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/sign-up', '/forgot-password', '/handler/*']
  
  // If on public route, check if user is already logged in
  if (publicRoutes.includes(to.path)) {
    if (auth.user) {
      // redirect to calendar while index page is not ready
      return navigateTo('/')
    }
    // Check if user has valid authentication
    try {
      const isAuthenticated = await auth.checkAuth()
      if (isAuthenticated) {
        // redirect to calendar while index page is not ready
        return navigateTo('/')
      }
    } catch (error: any) {
      // Handle database connection errors
      if (error?.message === 'Database connection failed') {
        console.error('🚨 Database connection failed.')
        return navigateTo('/login?error=db_connection_failed')
      }
      // For other errors, stay on login page
    }
    return
  }

  // For all other pages, check authentication
  try {
    const isAuthenticated = await auth.checkAuth()
    if (!isAuthenticated) {
      return navigateTo('/login')
    }
  } catch (error: any) {
    console.error('Authentication check failed:', error)
    // Handle database connection errors
    if (error?.message === 'Database connection failed') {
      console.error('🚨 Database connection failed. Redirecting to login.')
      return navigateTo('/login?error=db_connection_failed')
    }
    // For other errors, redirect to login
    return navigateTo('/login')
  }
})
