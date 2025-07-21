<template>
<div class="flex flex-col gap-2">
    <div class="flex gap-2 col-grid">
        <div class="flex flex-col gap-2">
            <div style="display: flex; justify-content: space-between;">
                <Label>Service Type</Label>
                <Popover v-model:open="serviceGroupPopover">
                    <PopoverTrigger style="height: 1.2em;" class="cursor-pointer">
                        <Icon  name="lucide:boxes" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <ServiceGroup />
                    </PopoverContent>
                </Popover>
            </div>
            <MyCombobox placeholder="Select Service Type" v-model="serviceType"/>
        </div>
        <div class="flex flex-col gap-2">
            <div style="display: flex; justify-content: space-between;">
                <Label>Service</Label>
                <Popover v-model:open="servicePopover">
                    <PopoverTrigger style="height: 1.2em;" class="cursor-pointer">
                        <Icon  name="lucide:box" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <Service />
                    </PopoverContent>
                </Popover>
            </div>
            <MyCombobox placeholder="Select Service" v-model="service"/>
        </div>
    </div>
    <div class="flex flex-col gap-2 col-grid">
        <div class="flex flex-col gap-2">
            <div style="display: flex; justify-content: space-between;">
                <Label>Vehicle</Label>
                <Popover v-model:open="vehiclePopover">
                    <PopoverTrigger style="height: 1.2em;" class="cursor-pointer">
                        <Icon  name="lucide:car-taxi-front" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <Vehicle />
                    </PopoverContent>
                </Popover>
            </div>
            <MyCombobox placeholder="Select vehicle" v-model="vehicle"/>
        </div>
        <div class="flex flex-col gap-2">
            <div style="display: flex; justify-content: space-between;">
                <Label>Driver</Label>
                <Popover v-model:open="driverPopover">
                    <PopoverTrigger style="height: 1.2em;" class="cursor-pointer">
                        <Icon  name="lucide:square-user-round" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <Driver />
                    </PopoverContent>
                </Popover>
            </div>
            <MyCombobox 
                placeholder="Select driver" 
                v-model="selectedDriver"
                :items="teamMembers"
            />
        </div>
    </div>
    <div class="flex gap-2 col-grid">
        <div class="flex flex-col gap-2">
            <Label>Price</Label>
            <Input type="number" v-model="price"/>
        </div>
        <div class="flex flex-col gap-2">
            <Label>Discount</Label>
            <Input type="number" v-model="discount"/>
        </div>
    </div>
    <div class="flex gap-2 col-grid">
        <div class="flex flex-col gap-2">
            <Label>Date</Label>
            <MyDate v-model:value="date"/>
        </div>
        <div class="flex flex-col gap-2">
            <Label>Time</Label>
            <MyTime v-model:value="time"/>
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <Label>Pick Up</Label>
        <Input placeholder="" v-model="pickUp"/>
    </div>
    <div class="flex flex-col gap-2">
        <Label>Drop Off</Label>
        <Input placeholder="" v-model="dropOff"/>
    </div>
    <div class="flex flex-col gap-2">
        <Label>Service Notation</Label>
        <Textarea v-model="notation"/>
    </div>
</div>
</template>
<script>

export default {
    props: {
        modelValue: {
            type: Object,
            required: true
        }
    },
    emits: ['update:modelValue'],
    computed: {
        serviceType: {
            get() { return this.modelValue.serviceType },
            set(value) { 
                console.log('Setting serviceType:', value);
                this.updateValue('serviceType', value) 
            }
        },
        service: {
            get() { return this.modelValue.service },
            set(value) { 
                console.log('Setting service:', value);
                this.updateValue('service', value) 
            }
        },
        vehicle: {
            get() { return this.modelValue.vehicle },
            set(value) { 
                console.log('Setting vehicle:', value);
                this.updateValue('vehicle', value) 
            }
        },
        driver: {
            get() { 
                return this.modelValue.driver?.value 
            },
            set(selectedDriver) { 
                console.log('Setting driver object:', selectedDriver);
                this.updateValue('driver', selectedDriver); 
            }
        },
        price: {
            get() { return this.modelValue.price },
            set(value) { 
                console.log('Setting price:', value);
                this.updateValue('price', Number(value)) 
            }
        },
        discount: {
            get() { return this.modelValue.discount },
            set(value) { 
                console.log('Setting discount:', value);
                this.updateValue('discount', Number(value)) 
            }
        },
        date: {
            get() { 
                console.log('Getting date:', this.modelValue.date);
                return this.modelValue.date 
            },
            set(value) { 
                console.log('Setting date:', value);
                this.updateValue('date', value) 
            }
        },
        time: {
            get() { 
                console.log('Getting time:', this.modelValue.time);
                return this.modelValue.time 
            },
            set(value) { 
                console.log('Setting time:', value);
                this.updateValue('time', value) 
            }
        },
        pickUp: {
            get() { return this.modelValue.pickUp },
            set(value) { 
                console.log('Setting pickUp:', value);
                this.updateValue('pickUp', value) 
            }
        },
        dropOff: {
            get() { return this.modelValue.dropOff },
            set(value) { 
                console.log('Setting dropOff:', value);
                this.updateValue('dropOff', value) 
            }
        },
        notation: {
            get() { 
                console.log('Getting notation:', this.modelValue.notation);
                return this.modelValue.notation 
            },
            set(value) { 
                console.log('Setting notation:', value);
                this.updateValue('notation', value) 
            }
        }
    },
    methods: {
        updateValue(key, value) {
            console.log('updateValue called with:', key, value);
            const updatedValue = {
                ...this.modelValue,
                [key]: value
            };
            console.log('Emitting updated value:', updatedValue);
            this.$emit('update:modelValue', updatedValue);
        },
        async getTeamMembers() {
            const team = this.$route.params.team;
            if (!team) {
                console.warn('Team ID is not available in BookingLine.');
                return;
            }
            try {
                const members = await this.$authFetch('/api/team/member', {
                    params: { team: team }
                });
                
                // Map the response to the format expected by MyCombobox
                this.teamMembers = members.map(member => ({
                    value: member.id,
                    label: member.name
                }));
            } catch (e) {
                console.error('Error fetching team members:', e);
            }
        }
    },
    data() {
        return {
            serviceGroupPopover: false,
            servicePopover: false,
            vehiclePopover: false,
            driverPopover: false,
            teamMembers: [],
            selectedDriver: null,
        }
    },
    mounted() {
        this.getTeamMembers();
        this.selectedDriver = this.modelValue.driver;
    },
    watch: {
        selectedDriver(newDriver) {
            this.updateValue('driver', newDriver);
        },
        'modelValue.driver'(newDriverFromParent) {
            this.selectedDriver = newDriverFromParent;
        },
        serviceGroupPopover(newVal) {
            this.$store.setPopoverState(newVal)
        },
        servicePopover(newVal) {
            this.$store.setPopoverState(newVal)
        },
        vehiclePopover(newVal) {
            this.$store.setPopoverState(newVal)
        },
        driverPopover(newVal){
            this.$store.setPopoverState(newVal)
        },
    },
    computed:{
        team(){
            return this.$route.params.team;
        }
    }
}
</script>
<style>
.col-grid{
    display: grid;
    grid-template-columns: 1fr 1fr;
}
</style>