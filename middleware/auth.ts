export default defineNuxtRouteMiddleware((to, from) => {
  // Use the useCookie composable to get the access token.
  // This works on both the server and the client.
  const accessToken = useCookie('access_token').value

  // If there's no access token and the user is trying to access any page
  // other than the login page, redirect them.
  if (!accessToken && to.path !== '/login') {
    // Redirect them to the login page, replacing the current entry
    // in the history so the user can't click "back" to the protected page.
    return navigateTo('/login', { replace: true })
  }
}) 