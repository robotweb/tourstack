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
<script setup>
definePageMeta({
})
</script>
<script>
export default{
    data(){
        return{
            name: null,
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
        async signup(){
            if (!this.email || !this.password) {
                this.$toast.error("Email and password are required")
                return
            }
            
            const result = await this.authStore.signup(this.email, this.password, this.name)
            console.log('Signup result:', result)
            
            if (result.success) { 
                navigateTo("/")
                this.$toast.success("Signup successful!")
            } else {
                this.$toast.error("Signup failed", result.error)
            }
        },
        navigateToLogin(){
            return navigateTo("/login");
        }
    }
}
</script>