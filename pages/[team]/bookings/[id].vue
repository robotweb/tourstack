<template>
	<div>
		<div v-if="loading">Loading...</div>
		<div v-else class="section p-4 w-1/2 mx-auto">
			<Booking :initialBooking="booking" @saved="handleSaved" />
		</div>
	</div>
</template>

<script>
import Booking from '~/components/Booking.vue'

definePageMeta({
	layout: 'auth',
	middleware: 'auth'
})

export default {
	components: { Booking },
	data() {
		return {
			booking: null,
			loading: false,
			error: null
		}
	},
	async mounted() {
		const { id } = this.$route.params
		if (id && id !== 'new') {
			this.loading = true
			try {
				const res = await this.$authFetch(`/api/booking/${id}`)
				if (!res.ok) throw new Error('Failed to load booking')
				this.booking = await res.json()
			} catch (e) {
				this.error = e
				this.$toast && this.$toast.error('Could not load booking')
			} finally {
				this.loading = false
			}
		}
	},
	methods: {
		handleSaved(saved) {
			// After save, navigate back to the bookings list (adjust if you have a detail page)
			return navigateTo(`/${this.$route.params.team}/bookings`)
		}
	}
}
</script>
