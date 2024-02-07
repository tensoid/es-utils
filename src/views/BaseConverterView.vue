<script setup lang="ts">
import { computed, ref } from "vue";

function convert(
  fromRadix: number,
  toRadix: number,
  value: string
): string | undefined {
  const parsedNum = parseInt(value, fromRadix);
  if (isNaN(parsedNum)) return undefined;
  return parsedNum.toString(toRadix);
}

const value = ref("0");
const fromRadix = ref(10);
const toRadix = ref(16);

const convertedValue = computed(() => {
  const input = value.value.replace(/\s/g, "");
  if (input == "") return "0";
  let convertedValue = convert(fromRadix.value, toRadix.value, input);
  if (convertedValue == undefined) return "undefined";
  return convertedValue;
});
</script>

<template>
  <div class="page-wrapper">
    <h1><span style="color: var(--color-highlight);">Base</span> Converter</h1>
    <div class="converter-form">
      <label for="value">Enter number</label>
      <input v-model="value" type="text" id="value" />
      <div class="base-selectors">
        <div class="base-selector">
          <label for="value">From Base</label>
          <select v-model="fromRadix" id="from-radix">
            <option v-for="i in 31" :value="i + 1">{{ i + 1 }}</option>
          </select>
        </div>
        <div class="base-selector">
          <label for="value">To Base</label>
          <select v-model="toRadix" id="to-radix">
            <option v-for="i in 31" :value="i + 1">{{ i + 1 }}</option>
          </select>
        </div>
      </div>
      <div class="result">
        <span >Result</span>
        <span>{{ convertedValue }}</span>
      </div>
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
  height: 70vh;
  width: 25vw;
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;
  color: var(--color-text-soft);
  padding: 2rem;
  box-sizing: border-box;

  .result {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    align-items: center;
    border: 1px solid var(--color-highlight);
    padding: 0.2rem 2rem;
  }

  .base-selectors {
    display: flex;
    width: 100%;
    gap: 10%;

    .base-selector {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }

  select,
  input {
    margin-bottom: 1rem;
    border: 1px solid white;
    background-color: var(--color-background-soft);
    width: 100%;
    box-sizing: border-box;
  }

  option {
    background-color: var(--color-background-soft);
  }
}
</style>
