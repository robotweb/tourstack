import { defineNuxtPlugin } from '#app'
import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('toast', toast)
}) 