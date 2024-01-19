<script setup lang="ts">

import { ref, computed } from 'vue'
import { computeMcClusky } from '../es-utils/mcclusky'




// Input Table
const inputs = ref(["S0", "S1", "S2"]);

const truthTableRows = computed(() => Math.pow(2, inputs.value.length));

function addInput(){
  inputs.value.push("");
}


// Output Table
type OutputBit = '0' | '1' | 'X';

interface LogicFunction {
  name: string,
  outputs: Array<OutputBit>
}

const outputs = ref([] as Array<LogicFunction>);

outputs.value.push({
  name: "F",
  outputs: Array<OutputBit>(truthTableRows.value).fill("0")
});

function addLogicFunction(){
  outputs.value.push({
    name: "",
    outputs: Array<OutputBit>(truthTableRows.value).fill("0")
  });

  // TODO: update other functions
}

function toggleBit(colIndex: number, rowIndex: number){
  let value = outputs.value[colIndex].outputs[rowIndex - 1];
  if(value == '0') outputs.value[colIndex].outputs[rowIndex - 1] = '1';
  else if(value == '1') outputs.value[colIndex].outputs[rowIndex - 1] = 'X';
  else outputs.value[colIndex].outputs[rowIndex - 1] = '0';
}

// Results
const minimizedFunctions = computed(() => {
  return outputs.value.map(func => {
    const minterms = new Set(func.outputs.reduce((terms, bit, index) => bit == '1' ? [...terms, index] : terms, [] as Array<number>));
    const dontCares = new Set(func.outputs.reduce((terms, bit, index) => bit == 'X' ? [...terms, index]: terms, [] as Array<number>));
    console.log(dontCares);
    return computeMcClusky(inputs.value, minterms, dontCares);
  })
});

</script>

<template>
  <div class="tables">
    <table class="inputs-table">
      <tr>
        <th v-for="(_, index) in inputs">
          <input v-model="inputs[index]">
        </th>
        <th>
          <button class="add-button" @click="addInput">+</button>
        </th>
      </tr>
      <tr v-for="rowIndex in truthTableRows">
        <td class="bit" v-for="colIndex in inputs.length" >{{ ((rowIndex - 1) >> (inputs.length - colIndex)) & 1}}</td>
      </tr>
    </table>

    <table class="outputs-table">
      <tr>
        <th v-for="func in outputs">{{ func.name }}</th>
        <th>
          <button class="add-button" @click="addLogicFunction">+</button>
        </th>
      </tr>
      <tr v-for="rowIndex in truthTableRows">
        <td class="bit" @click="toggleBit(colIndex, rowIndex)" v-for="(func, colIndex) in outputs" >{{ func.outputs[rowIndex - 1] }}</td>
      </tr>
    </table>
  </div>
  
  <p v-for="(func, index) in minimizedFunctions" >{{ outputs[index].name + ": " + func }}</p>
</template>

<style scoped lang="scss">

.tables {

  display: flex;
  flex-direction: row;

  .inputs-table, .outputs-table {
    border: 1px solid var(--color-table-border);
    border-collapse: collapse;

    input {
      width: 5ch;
      background-color: transparent;
      color: white;
      border: none;
      text-align: center;
    }

    th {
      width: 5ch;
      border: 1px solid var(--color-table-border);
    }

    tr:nth-child(4n + 1) {
      border-bottom: 1px solid var(--color-table-border);
    }

    td {
      border-right: 1px solid var(--color-table-border);
      border-left: 1px solid var(--color-table-border);
    }

    .bit {
      text-align: center;
      user-select: none;
    }

    .add-button {
      background-color: transparent;
      color: white;
      border: none;
    }
  }
}

</style>