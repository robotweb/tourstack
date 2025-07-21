<template>
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <Input placeholder="Customer" v-model="name"/>
        <div class="flex gap-2">
            <Input placeholder="First name" v-model="firstname"/>
            <Input placeholder="Last name" v-model="lastname"/>
        </div>
        <div class="flex gap-2">
            <Input placeholder="Phone" v-model="phone"/>
            <Input placeholder="Email" v-model="email"/>
        </div>
        <Input placeholder="Street address" v-model="address1"/>
        <div class="flex gap-2">
            <Input placeholder="City" v-model="address1"/>
            <Input placeholder="Province" v-model="address2"/>
        </div>
        <div class="flex gap-2">
            <Input placeholder="Country" v-model="address3"/>
            <Input placeholder="Code" v-model="address4"/>
        </div>
        <Button @click="save">Save</Button>
    </div>
</template>
<script>
export default{
    data(){
        return {
            customer: null,
            selectedCustomer: null,
            customerPopover: false,
            bookingDetailLines: [{}],
            customers: []
        }
    },
    async mounted() {
    },
    methods:{
        async save(){
            try {
                const response = await this.$authFetch('/api/customer',{
                    method: "POST",
                    body: {
                        name: this.name,
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