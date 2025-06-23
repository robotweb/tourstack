<template>
    <div class="flex justify-center items-center h-screen w-full p-4">
        <Card class="w-[400px] max-w-full">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
                <Input placeholder="Email" type="text"/>
                <Button @click="resetPassword()" class="cursor-pointer">Reset password</Button>
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

    },
    mounted(){

    },
    methods:{
        resetPassword(){

        },
        navigateToLogin(){
            return navigateTo("/login");
        }
    }
}
</script>