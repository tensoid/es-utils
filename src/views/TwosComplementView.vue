<script setup lang="ts">
import { ref } from "vue";

const decimalValue = ref("0");
const binaryValue = ref("0");

function decimalToBinary() {

  if(decimalValue.value.length == 0) {
    binaryValue.value = "0";
    return;
  }

  const isNegative: boolean = decimalValue.value.startsWith("-");
  const absoluteValue = Math.abs(parseInt(decimalValue.value));

  if(!isNegative) {
    binaryValue.value = "0" + absoluteValue.toString(2);
  }
  else {
    binaryValue.value = getBits(~absoluteValue + 1, Math.ceil(Math.log2(absoluteValue)) + 1);
  }
}

function binaryToDecimal() {

  if(binaryValue.value.length == 0) {
    decimalValue.value = "0";
    return;
  }

  const isNegative: boolean = binaryValue.value.startsWith("1");
  const number = parseInt(binaryValue.value, 2);

  if(!isNegative) {
    decimalValue.value = parseInt(binaryValue.value, 2).toString();
  }
  else {
    decimalValue.value = (isNegative ? "-" : "") + parseInt(getBits(~number + 1, Math.ceil(Math.log2(number + 1))), 2);
  }
}

function getBits(value: number, numBits: number): string {
  let bits: Array<string> = [];

  for(let i = 0; i < numBits; i++) {
    bits.push((value & (1 << i)) != 0 ? "1" : "0");
  }

  return bits.reverse().join('');
}

</script>

<template>
  <div class="page-wrapper">
    <h1><span style="color: var(--color-highlight);">Two's</span> complement</h1>
    <div class="converter-form">
      <label for="value">Decimal</label>
      <input @input="decimalToBinary()" v-model="decimalValue" type="text" id="value" />
      <label for="value">Binary</label>
      <input @input="binaryToDecimal()" v-model="binaryValue" type="text" id="value" />
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
  height: 40vh;
  width: 20vw;
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;
  color: var(--color-text-soft);
  padding: 2rem;
  box-sizing: border-box;

  input {
    margin-bottom: 1rem;
    border: 1px solid white;
    background-color: var(--color-background-soft);
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
