<template>
    <div class="flex justify-center items-center h-screen w-full p-4">
        <Card class="w-[400px] max-w-full">
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Email" type="text" v-model="email"/>
                <Input placeholder="Password" type="password" v-model="password" @keyup.enter="login"/>
                <p class="text-sm cursor-pointer" @click="navigateToForgotPassword">Forgot password?</p>
                <Button @click="login" class="cursor-pointer">Login</Button>
                <Button @click="navigateToSignup" variant="secondary" class="cursor-pointer">Sign up</Button>
            </CardContent>
        </Card>
    </div>
</template>
<script setup>
definePageMeta({
})
</script>
<script>
export default{
    data(){
        return{
            email: null,
            password: null
        }
    },
    computed: {
        authStore() {
            return useAuthStore()
        }
    },
    watch: {
        'authStore.isLoggedIn'(isLoggedIn) {
            if (isLoggedIn) {
                navigateTo('/')
            }
        }
    },
    methods:{
        async login(){
            if (!this.email || !this.password) {
                this.$toast.error("Email and password are required")
                return
            }
            
            const result = await this.authStore.login(this.email, this.password)
            console.log('Login result:', result)
            
            if (result.success) { 
                navigateTo("/")
                this.$toast.success("Login successful!")
            } else {
                this.$toast.error("Login failed", result.error)
            }
        },
        navigateToSignup() {
            return navigateTo('/sign-up')
        },
        navigateToForgotPassword(){
            return navigateTo('/forgot-password')
        }
    }
}
</script>