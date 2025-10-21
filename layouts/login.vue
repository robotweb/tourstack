<template>
  <main>
      <slot /> <!-- where the login page gets injected -->
  </main>
</template>

<script>
export default {
  mounted() {
    console.log('login layout mounted')
  }
}
</script>