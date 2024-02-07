<script setup lang="ts">
defineProps(["title", "description", "route"]);
</script>

<template>
  <div @click="$router.push(route)" class="card">
    <h3 class="title">{{ title }}</h3>
    <p class="description">{{ description }}</p>
  </div>
</template>

<style scoped lang="scss">
.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: var(--color-background-soft);
  width: 300px;
  height: 150px;
  cursor: pointer;

  transition: 300ms;

  border: 1px solid transparent;

  &:hover {
    border: 1px solid var(--color-highlight);
  }

  .title {
  }

  .description {
    color: var(--color-text-soft);
    text-align: center;
  }
}
</style>
