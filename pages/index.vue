<template>
</template>
<script setup>
definePageMeta({
})
</script>
<script>
export default{
    data(){
        return{

        }
    },
    mounted(){
        this.me()
    },
    methods:{
        async me(){
            try{
                const response = await this.$authFetch("/api/auth/me",{
                })
                console.log(response)
                const user = response.id
                const teams = await this.$authFetch("/api/team",{
                    method: "GET",
                    params: {
                        user: user
                    }

                })
                console.log(teams)
                if(teams && teams.length == 1){
                    const team = teams[0]
                    return navigateTo("/"+team.uid)
                }
            }catch(e){
                console.log(e)
            }


        }
    }
}
</script>