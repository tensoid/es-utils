<script setup lang="ts">
import FeatureCard from '../components/FeatureCard.vue'
</script>

<template>
  <div class="page-wrapper">
    <h1 class="title">Utilities for everything <span style="color: var(--color-highlight);">embedded systems</span></h1>
    <div class="title-page-divider"></div>
    <div class="cards-container">
      <FeatureCard title="Quine-McClusky" route="quine-mcclusky" description="The Quine-McClusky algorithm for 2-level-optimization."></FeatureCard>
      <FeatureCard title="Base Converter" route="base-converter" description="Convert a number from and to any base."></FeatureCard>
      <FeatureCard title="Two's complement" route="twos-complement" description="Convert a number from decimal into the Two's complement."></FeatureCard>
      <FeatureCard title="Logics" route="logics" description="An interactive circuit design and simulation tool."></FeatureCard>
      <FeatureCard title="Coming soon..." route="/" description="Coming soon..."></FeatureCard>
      <FeatureCard title="Coming soon..." route="/" description="Coming soon..."></FeatureCard>
    </div>
  </div>

</template>

<style scoped lang="scss">

.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 5%;
}

.cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
}

.title-page-divider {
  width: 50px;
  height: 2px;
  background-color: var(--color-text);
  margin-bottom: 2rem;
}
</style>
