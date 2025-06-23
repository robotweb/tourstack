<template>
    <Button @click="logout()">
        Logout
    </Button>
</template>
<script>
export default{
    methods:{
        logout(){
            const accessTokenCookie = useCookie('access_token')
            const refreshTokenCookie = useCookie('refresh_token')
            accessTokenCookie.value = null
            refreshTokenCookie.value = null
            return navigateTo('/login')
        }
    }
}
</script>