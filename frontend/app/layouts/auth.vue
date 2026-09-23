<template>
  <div class="auth">
    <slot />
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%);
}
</style>
