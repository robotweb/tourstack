<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="booking in bookings" :key="booking.id">
        {{ booking }}
      </div>
    </div>
    <!-- booking dialogue-->
    <Dialog v-model:open="isBookingDialogOpen">
      <DialogContent>
        <DialogHeader>
          <!-- <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> -->
        </DialogHeader>
        <div 
          class="max-h-[80vh] overflow-y-auto scrollbar-hide" 
          style="padding: 8px;"
          :class="{ 'overflow-hidden': $store.isAnyPopoverOpen }"
        >
          <Booking class="overflow-visible" />
        </div>
      </DialogContent>
    </Dialog>
  </div>
  <div class="section">
  </div>
</template>

<script>
definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})
export default {
  data() {
    return {
      loading: false,
      bookings: [],
      isBookingDialogOpen: false
    }
  },
  methods: {
    async getBookings() {
      this.$store.setLoading(true)
      try {
        const response = await this.$authFetch(API_URL + '/booking')
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        const data = await response.json()
        this.bookings = data
      } catch (e) {
        console.error('Error fetching bookings:', e)
        this.$store.setError(e)
      } finally {
        this.$store.setLoading(false)
      }
    }
  },
  mounted() {
    //this.getBookings()
  },
  computed:{
    clientUid(){
      const team = this.$route.params.team
      return team
    }
  }
}
</script>

<style scoped>
.overflow-hidden{
  overflow-y: hidden !important;
}

.navigation{
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px;
}

.section-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

</style>