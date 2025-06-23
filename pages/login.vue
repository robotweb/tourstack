<template>
    <div class="flex justify-center items-center h-screen w-full p-4">
        <Card class="w-[400px] max-w-full">
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Email" type="text" v-model="email"/>
                <Input placeholder="Password" type="password" v-model="password"/>
                <p class="text-sm cursor-pointer" @click="navigateToForgotPassword()">Forgot password?</p>
                <Button @click="login()" class="cursor-pointer">Login</Button>
                <Button @click="navigateToSignup()" variant="secondary" class="cursor-pointer">Sign up</Button>
            </CardContent>
        </Card>
    </div>
</template>
<script>
definePageMeta({
  middleware: 'noauth'
})
export default{
    data(){
        return{
            email: null,
            password: null
        }
    },
    mounted(){

    },
    methods:{
        async login(){
            const body = {
                email: this.email,
                password: this.password
            }
            try{
                const response = await this.$authFetch("/api/auth/login",{
                    method: "POST",
                    body: body
                })

                console.log('Login response:', response)
                console.log('Response type:', typeof response)
                console.log('Response keys:', Object.keys(response))
                console.log('Response access_token:', response.access_token)
                console.log('Response refresh_token:', response.refresh_token)
                console.log('Response has access_token:', 'access_token' in response)
                console.log('Response has refresh_token:', 'refresh_token' in response)

                // Use the setStoredTokens function from auth-fetch plugin
                this.$setStoredTokens(response)
                
                // Handle successful login
                this.$toast.success("Login successful!")
                // Redirect to dashboard or home
                navigateTo("/")
            }catch(e){                
                // Show the user-friendly error message
                this.$toast.error("Request error")
            }
        },
        navigateToSignup() {
            return navigateTo('/signup')
        },
        navigateToForgotPassword(){
            return navigateTo('/forgot-password')
        }
    }
}
</script>