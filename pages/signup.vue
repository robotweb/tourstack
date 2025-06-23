<template>
        <div class="flex justify-center items-center h-screen w-full p-4">
        <Card class="w-[400px] max-w-full">
            <CardHeader>
                <CardTitle>Sign up</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Name" type="text" v-model="name" />
                <Input placeholder="Email" type="text" v-model="email"/>
                <Input placeholder="Password" type="password" v-model="password"/>
                <Button @click="signup()" class="cursor-pointer">Sign up</Button>
                <Button @click="navigateToLogin()" variant="secondary" class="cursor-pointer">Back to login</Button>
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
            name: null,
            email: null,
            password: null
        }
    },
    mounted(){

    },
    methods:{
        async signup(){
            const body = {
                email: this.email,
                password: this.password,
                name: this.name
            }
            try{
                const response = await this.$authFetch("/api/auth/signup",{
                    method: "POST",
                    body: body
                })
                console.log('Signup response:', response)
                
                // Use the setStoredTokens function from auth-fetch plugin
                this.$setStoredTokens(response)
                
                console.log('Cookies set successfully')
                
                // Handle successful signup
                this.$toast.success("Success")
                console.log('Toast shown, redirecting...')
                
                // Redirect to login or dashboard
                navigateTo("/login")
            }catch(e){                
                console.log('Signup error:', e)
                this.$toast.error("Request error")
            }
        },
        navigateToLogin(){
            return navigateTo("/login");
        }
    }
}
</script>