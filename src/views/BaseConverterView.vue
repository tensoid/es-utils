<script setup lang="ts">
import { computed, ref } from "vue";

function convert(fromRadix: number, toRadix: number, value: string): string {
  return parseInt(value, fromRadix).toString(toRadix);
}

const value = ref("0");
const fromRadix = ref(10);
const toRadix = ref(16);

const convertedValue = computed(() => {
  let convertedValue = convert(fromRadix.value, toRadix.value, value.value);
  if(isNaN(parseInt(convertedValue))) return "undefined";
  return convertedValue;
});

</script>

<template>
  <div class="page-wrapper">
    <h1>Base Converter</h1>
    <div class="converter-form">
      <label for="value">Enter number</label>
      <input v-model="value" type="text" id="value">
      <label for="value">From Base</label>
      <input v-model="fromRadix" type="number" id="from-radix">
      <label for="value">To Base</label>
      <input v-model="toRadix" type="number" id="to-radix">
      <span>Result</span>
      <span>{{ convertedValue }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.converter-form {
  height: 50vh;
  width: 20vw;
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;

  input {
    background-color: transparent;
    border: 1px solid white;
    margin-bottom: 1rem;
  }
}
</style>
