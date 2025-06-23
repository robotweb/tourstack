export default defineNuxtRouteMiddleware((to, from) => {
  // Use the useCookie composable to get the access token.
  // This works on both the server and the client.
  const accessToken = useCookie('access_token').value

  if(accessToken){
    return navigateTo('/', { replace: true })
  }

}) 