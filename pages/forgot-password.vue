<template>
    <div class="flex justify-center items-center h-screen w-full p-4" v-if="!loading">
        <Card class="w-[400px] max-w-full" v-if="isValid">
            <CardHeader>
                <CardTitle>
                    Create a new password
                </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Password" type="password" v-model="password"  @keyup.enter="changePassword"/>
                <Button class="cursor-pointer" @click="changePassword">Change Password</Button>
            </CardContent>
        </Card>
        <Card class="w-[400px] max-w-full" v-else>
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Email" type="text" v-model="email" @keyup.enter="resetPassword"/>
                <Button @click="resetPassword" class="cursor-pointer">Reset password</Button>
                <Button @click="navigateToLogin" variant="secondary" class="cursor-pointer">Back to login</Button>
            </CardContent>
        </Card>
    </div>
</template>
<script>
definePageMeta({
})
export default{
    data(){
        return {
            email: null,
            loading: true,
            isValid: 0,
            password: null
        }
    },
    mounted(){
        this.validateCode();
    },
    computed:{
        code() {
            return this.$route.query.code;
        }
    },
    methods:{
        async resetPassword(){
            if (!this.email) {
                this.error = 'Please enter your email address';
                this.$toast.error(this.error)
                return;
            }

            this.loading = true;
            this.error = '';
            this.success = '';

            try {
                const callbackUrl = `${window.location.origin}/forgot-password`;

                const requestBody = {
                    email: this.email,
                    callback_url: callbackUrl
                };

                console.log('Sending password reset request:', requestBody);

                const response = await $fetch('/api/auth/password/send-reset-code', {
                    method: 'POST',
                    body: requestBody
                });

                console.log('Password reset response:', response);

                this.$toast.success("Password reset email sent! Please check your inbox.");
                this.email = ''; // Clear the email field
            } catch (error) {
                console.error('Password reset error details:', error);
                this.error = error.data?.error?.message || error.message || 'Failed to send reset email. Please try again.';
                this.$toast.error(this.error);
            } finally {
                this.loading = false;
            }
        },
        async validateCode(){
            try{
                this.loading = true
                if(!this.code){
                    this.isValid = 0;
                    this.loading = false;
                    return
                }
                const response = await this.$authFetch('/api/auth/password/validate-code',{
                    method: "POST",
                    body: {
                        code: this.code
                    }
                })
                if(response.is_code_valid){
                    this.isValid = 1
                }
            }catch(e){
                this.$toast.error(e.data.statusText, {
                    description: e.data.error.error
                })
            }
            this.loading = false
        },
        async changePassword(){
            try{
                const response = await this.$authFetch('/api/auth/password/reset-password',{
                    method: "POST",
                    body: {
                        password: this.password,
                        code: this.code
                    }
                })
                console.log(response)
                this.$toast.success('Success')
                this.navigateToLogin()
            }catch(e){
                console.log(e.data)
                this.$toast.error(e.data.statusText,{
                    description: e.data.error.error
                })
            }
        },
        navigateToLogin(){
            return navigateTo("/login");
        }
    },
}
</script>