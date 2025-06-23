<template>
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <Input placeholder="Name" type="text" v-model="name"/>
        <Input placeholder="Email" type="text" v-model="email" />
        <Button @click="save()">Save</Button>
    </div>
</template>
<script>
export default{
    data(){
        return{
            name: null,
            email: null
        }
    },
    methods: {
        async save(){
            try{
                const team = this.$route.params.team;
                const response = await this.$authFetch(API_URL+"/team/members",{
                    method: "POST",
                    body: {
                        team_id: team,
                        name: this.name,
                        email: this.email
                    }
                })
                console.log(response)
            }catch(e){
                console.log(e)
                this.$toast.error("Request error");
            }
            
        }
    }
}
</script>