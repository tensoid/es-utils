<script setup lang="ts">
import { ref, computed, type Ref, onMounted, onBeforeMount, nextTick } from "vue";
import { computeMcClusky } from "../es-utils/mcclusky";

let circuitSpec: Ref<CircuitSpec> = ref({
  inputs: [],
  outputs: [],
  name: "",
  id: "",
  inputDontCares: [],
});

// Input Dont Cares
const inputDontCareRowIndexes = computed(() => {

  let dontCares = new Set<number>();

  for(let i = 0; i < truthTableRows.value; i++) {
    let bitString = i.toString(2).padStart(circuitSpec.value.inputs.length, "0");

    circuitSpec.value.inputDontCares.forEach(idc => {

      if (idc.length == 0) return;

      let isDontCare = idc.every(idcPair => {
        let inputIndex = circuitSpec.value.inputs.findIndex(input => input == idcPair.input);
        if (inputIndex == -1) return false;

        return bitString[inputIndex] == idcPair.value;
      });

      if (isDontCare) dontCares.add(i);
    });
  }

  return dontCares;
});

function addInputDontCare() {
  circuitSpec.value.inputDontCares.push([
    {
      input: "?",
      value: "0"
    }
  ]);

  saveCircuit();
}

function removeInputDontCare(dontCareIndex: number) {
  circuitSpec.value.inputDontCares.splice(dontCareIndex, 1);

  saveCircuit();
}

function addDontCarePair(dontCareIndex: number) {

  circuitSpec.value.inputDontCares[dontCareIndex].push({
    input: "?",
    value: "0"
  });

  saveCircuit();
}

function removeDontCarePair(dontCareIndex: number, pairIndex: number) {

  circuitSpec.value.inputDontCares[dontCareIndex].splice(pairIndex, 1);

  if (circuitSpec.value.inputDontCares[dontCareIndex].length == 0) {
    removeInputDontCare(dontCareIndex);
  }

  saveCircuit();
}

// Input Table
const truthTableRows = computed(() =>
  Math.pow(2, circuitSpec.value.inputs.length)
);

function addInput() {
  circuitSpec.value.inputs.push("?");

  circuitSpec.value.outputs.forEach((func) => {
    func.outputs.push(...Array<OutputBit>(func.outputs.length).fill("0"));
  });

  saveCircuit();
}

function removeInput(index: number) {
  if (circuitSpec.value.inputs.length == 1) return;
  circuitSpec.value.inputs.splice(index, 1);

  circuitSpec.value.outputs.forEach((func) => {
    func.outputs.splice(func.outputs.length / 2);
  });

  saveCircuit();
}

// Output Table
type OutputBit = "0" | "1" | "X";

interface LogicFunction {
  name: string;
  outputs: Array<OutputBit>;
}

// Output Table
function addLogicFunction() {
  circuitSpec.value.outputs.push({
    name: "?",
    outputs: Array<OutputBit>(truthTableRows.value).fill("0"),
  });

  saveCircuit();
}

function removeLogicFunction(index: number) {
  if (circuitSpec.value.outputs.length == 1) return;
  circuitSpec.value.outputs.splice(index, 1);

  saveCircuit();
}

function toggleBit(colIndex: number, rowIndex: number) {
  let value = circuitSpec.value.outputs[colIndex].outputs[rowIndex - 1];
  if (value == "0")
    circuitSpec.value.outputs[colIndex].outputs[rowIndex - 1] = "1";
  else if (value == "1")
    circuitSpec.value.outputs[colIndex].outputs[rowIndex - 1] = "X";
  else circuitSpec.value.outputs[colIndex].outputs[rowIndex - 1] = "0";

  saveCircuit();
}

// Results
const minimizedFunctions = computed(() => {
  return circuitSpec.value.outputs.map((func) => {
    let minterms = new Set(
      func.outputs.reduce(
        (terms, bit, index) => (bit == "1" ? [...terms, index] : terms),
        [] as Array<number>
      )
    );

    let dontCares = new Set(
      func.outputs.reduce(
        (terms, bit, index) => (bit == "X" ? [...terms, index] : terms),
        [] as Array<number>
      )
    );

    // Merge dont cares with input dont care rows
    inputDontCareRowIndexes.value.forEach(ri => dontCares.add(ri));

    // remove new dont cares from minterms
    dontCares.forEach(dc => minterms.delete(dc));

    return computeMcClusky(circuitSpec.value.inputs, minterms, dontCares);
  });
});

interface InputDontCarePair {
  input: string;
  value: "0" | "1";
}

type InputDontCare = Array<InputDontCarePair>;

// Save / Load
interface CircuitSpec {
  inputs: Array<string>;
  outputs: Array<LogicFunction>;
  name: string;
  id: string;
  inputDontCares: Array<InputDontCare>;
}

const circuitRenameDialogOpen = ref(false);
const circuitRenameInputElement = ref<HTMLInputElement>();

function openCircuitRenameDialog(){
  circuitRenameDialogOpen.value = true;
  nextTick(() => circuitRenameInputElement.value?.focus());
}

function renameCurrentCircuit() {
  if(circuitRenameInputElement.value == undefined) return;
  circuitSpec.value.name = circuitRenameInputElement.value.value;
  circuitRenameDialogOpen.value = false;
  saveCircuit();
}

const circuitSelectElement = ref<HTMLInputElement>();

const allCircuitSpecs = computed(() => {
  let circuits: Array<CircuitSpec> = getCircuitSpecs();

  // add current circuit name if it is not saved yet.
  if (circuits.findIndex(c => c.id == circuitSpec.value.id) == -1) {
    circuits.push(circuitSpec.value);
  }
  
  return circuits;
});

function initLocalStorage() {
  if (localStorage.getItem("circuits") == null) {
    localStorage.setItem("circuits", JSON.stringify([]));
  }
}

function getCircuitSpecs(): Array<CircuitSpec> {
  return JSON.parse(localStorage.getItem("circuits") || "[]");
}

function setCircuitSpecs(circuitSpecs: Array<CircuitSpec>){
  localStorage.setItem("circuits", JSON.stringify(circuitSpecs));
}

function saveCircuit() {
  let circuits: Array<CircuitSpec> = getCircuitSpecs();
  let circuitIndex = circuits.findIndex(
    (c) => c.id == circuitSpec.value.id
  );

  if (circuitIndex == -1) {
    circuits.push(circuitSpec.value);
  } else {
    circuits[circuitIndex] = circuitSpec.value;
  }

  setCircuitSpecs(circuits);
}

function loadCircuit() {
  let circuits: Array<CircuitSpec> = getCircuitSpecs();
  let selectedCircuit = circuits.find(
    (c) => c.id == circuitSelectElement.value?.value
  );
  if (selectedCircuit == undefined) return;
  circuitSpec.value = selectedCircuit;
}

function deleteCircuit() {
  let circuits: Array<CircuitSpec> = getCircuitSpecs();

  const index = circuits.findIndex(c => c.id == circuitSpec.value.id);
  if(index != -1) {
    circuits.splice(index, 1);
  }

  setCircuitSpecs(circuits);
  
  if(circuits.length == 0) newCircuit();
  else circuitSpec.value = circuits[0];
}

function newCircuit() {
  circuitSpec.value = {
    id: crypto.randomUUID(),
    name: "New Circuit",
    inputs: ["S0", "S1", "S2"],
    outputs: [
      {
        name: "F",
        outputs: Array<OutputBit>(8).fill("0"),
      },
    ],
    inputDontCares: [],
  };
}

onBeforeMount(() => {
  initLocalStorage();
});

onMounted(() => {
  newCircuit();
});
</script>

<template>
  <div class="page-wrapper">

    <div v-if="circuitRenameDialogOpen" class="circuit-name-input-dialog">
      <span>Circuit name</span>
      <input @keyup.enter="renameCurrentCircuit()" ref="circuitRenameInputElement" :placeholder="circuitSpec.name" type="text">
      <button @click="renameCurrentCircuit()">Ok</button>
    </div>

    <h1><span style="color: var(--color-highlight);">Quine-McCluskey</span> algorithm</h1>
    <div class="toolbar">
      <ul>
        <li>
          <select
            :value="circuitSpec.id"
            ref="circuitSelectElement"
            @input="loadCircuit()"
            name="circuits"
            id="circuits"
          >
            <option v-for="spec of allCircuitSpecs" v-bind:value="spec.id">
              {{ spec.name }}
            </option>
          </select>
        </li>
        <li><button @click="openCircuitRenameDialog()">Rename Circuit</button></li>
        <li><button @click="newCircuit()">New Circuit</button></li>
        <li><button @click="deleteCircuit()">Delete Circuit</button></li>
        <li><button>Export as...</button></li>
      </ul>
    </div>
    <div class="tables">
      <table class="inputs-table">
        <tr>
          <th v-for="(_, index) in circuitSpec.inputs">
            <div class="table-head">
              <button @click="removeInput(index)" class="remove-button">
                <svg width="20" height="20">
                  <image href="@/assets/icons/cross.svg" />
                </svg>
              </button>
              <input @input="saveCircuit()" v-model="circuitSpec.inputs[index]" />
            </div>
          </th>
          <th>
            <button class="add-button" @click="addInput">+</button>
          </th>
        </tr>
        <template v-for="rowIndex in truthTableRows">
          <tr v-if="!inputDontCareRowIndexes.has(rowIndex - 1)">
            <td class="bit" v-for="colIndex in circuitSpec.inputs.length">
              {{ ((rowIndex - 1) >> (circuitSpec.inputs.length - colIndex)) & 1 }}
            </td>
          </tr>
        </template>
      </table>

      <table class="outputs-table">
        <tr>
          <th v-for="(_, index) in circuitSpec.outputs">
            <div class="table-head">
              <button @click="removeLogicFunction(index)" class="remove-button">
                <svg width="20" height="20">
                  <image href="@/assets/icons/cross.svg" />
                </svg>
              </button>
              <input @input="saveCircuit()" v-model="circuitSpec.outputs[index].name" />
            </div>
          </th>
          <th>
            <button class="add-button" @click="addLogicFunction">+</button>
          </th>
        </tr>
        <template v-for="rowIndex in truthTableRows">
          <tr v-if="!inputDontCareRowIndexes.has(rowIndex - 1)">
            <td
              class="bit"
              @click="toggleBit(colIndex, rowIndex)"
              v-for="(func, colIndex) in circuitSpec.outputs"
            >
              {{ func.outputs[rowIndex - 1] }}
            </td>
          </tr>
        </template>
      </table>
    </div>

    <h3>Input Dont Cares</h3>

    <div class="input-dont-cares">
      <div class="input-dont-care" v-for="(inputDontCare, dontCareIndex) in circuitSpec.inputDontCares">
        <div class="input-dont-care-pair" v-for="(dontCarePair, pairIndex) in inputDontCare">
          <input type="text" v-model="dontCarePair.input">
          =
          <input type="text" v-model="dontCarePair.value">
          <button class="remove-pair-button" @click="removeDontCarePair(dontCareIndex, pairIndex)">-</button>
        </div>
        <button class="add-pair-button" @click="addDontCarePair(dontCareIndex)">+</button>
      </div>
      <button class="add-dont-care-button" @click="addInputDontCare">+</button>
    </div>

    <p v-for="(func, index) in minimizedFunctions">
      {{ circuitSpec.outputs[index].name + " = " + func }}
    </p>
  </div>
</template>

<style scoped lang="scss">

.page-wrapper {
  padding-left: 2rem;
}

.circuit-name-input-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 100px;
  border-radius: 10px;
  gap: 0.3rem;

  input {
    background-color: transparent;
    border: none;
    text-align: center;
  }

  button {
    background-color: transparent;
    border: none;
  }
}

.toolbar {

  padding-bottom: 0.5rem;

  ul {
    display: flex;
    flex-direction: row;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
    
    button,
    select {
      color: var(--color-text-soft);
      background-color: transparent;
      border: none;
      cursor: pointer;

      option {
        color: var(--color-text-soft);
        background-color: var(--color-background);
        border: none;
      }
    }
  }
}
.tables {
  display: flex;
  flex-direction: row;

  .inputs-table,
  .outputs-table {
    border: 1px solid var(--color-table-border);
    border-collapse: collapse;

    th {
      width: 5ch;
      border: 1px solid var(--color-table-border);

      .add-button {
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        transition: 0.3s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.164);
        }
      }

      .table-head {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        input,
        span {
          width: 5ch;
          background-color: transparent;
          color: white;
          border: none;
          text-align: center;
          height: 1.5rem;
          margin: 0;
          padding: 0;
        }

        .remove-button {
          background-color: transparent;
          border: none;
          padding: 1px;
          cursor: pointer;

          transition: 0.3s;

          &:hover {
            background-color: rgba(255, 255, 255, 0.164);
          }
        }
      }
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
  }
}

.input-dont-cares {

  display: flex;
  flex-direction: row;
  width: max-content;
  gap: 2rem;

  padding: 1rem;
  border: 1px solid white;

  button {
    background-color: transparent;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.164);
    }
  }
  
  .add-dont-care-button {
    border: 1px solid rgb(118, 255, 118);
  }
  
  .input-dont-care {
    
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    
    .add-pair-button {
      margin-top: 1rem;
      border: 1px solid rgb(118, 255, 118);
    }

    .input-dont-care-pair {

      display: flex;
      gap: 0.3rem;

      .remove-pair-button {
        border: 1px solid rgb(255, 87, 87);
      }

      input {
        background-color: transparent;
        border: 1px solid white;
        width: 3rem;
      }
    }
  }
}
</style>
