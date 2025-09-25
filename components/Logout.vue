<template>
    <div
        @click="logout()"
        role="button"
        tabindex="0"
        @keydown.enter.space="logout()"
        class="cursor-pointer"
    >
        <slot></slot>
    </div>
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