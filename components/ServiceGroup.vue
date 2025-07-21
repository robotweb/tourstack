<template>
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <Input placeholder="Name" v-model="name"/>
        <Textarea v-model="description" placeholder="Description"></Textarea>
        <Button @click="save()">Save</Button>
    </div>
</template>
<script>
export default{
    data(){
        return{
            name: null,
            description: null
        }
    },
    methods: {
        async save(){
            try {
                const response = await this.$authFetch('/api/service-type',{
                    method: "POST",
                    body: {
                        name: this.name,
                        description: this.description,
                        teamUid: this.$route.params.team
                    }
                })
                console.log(response)
                this.$emit("saved")
                this.$toast.success('Success')
            } catch (error) {
                this.$toast.error('Failed')
            }
        }
    }
}
</script>