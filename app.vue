<template>
  <Toaster position="top-center" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>