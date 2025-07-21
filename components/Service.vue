<template>
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <MyCombobox
            v-model="selectedServiceGroup"
            :items="serviceGroups"
            placeholder="Service Type"
        />
        <Input placeholder="Name" v-model="name"/>
        <Textarea v-model="description" placeholder="Description"></Textarea>
        <Button @click="save()">Save</Button>
    </div>
</template>
<script>
export default{
    data(){
        return {
            serviceGroups: [],
            selectedServiceGroup: null,
            name: null,
            description: null,
            price: null
        }
    }
}

</script>