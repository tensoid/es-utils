<script setup lang="ts">
import { ref, computed, type Ref, onMounted, onBeforeMount, nextTick } from "vue";
import { computeMcClusky } from "../es-utils/mcclusky";

let circuitSpec: Ref<CircuitSpec> = ref({
  inputs: [],
  outputs: [],
  name: "",
  id: ""
});

// Input Table
const truthTableRows = computed(() => {
    if (circuitSpec.value.inputs.length == 0) return 0;
    return circuitSpec.value.inputs[0].columns.length;
  }
);

function addTruthTableRow() {
  circuitSpec.value.inputs.forEach(input => {
    input.columns.push("0");
  });

  circuitSpec.value.outputs.forEach(output => {
    output.columns.push("0");
  });
}

function removeTruthTableRow(rowIndex: number) {
  circuitSpec.value.inputs.forEach(input => {
    input.columns.splice(rowIndex, 1);
  });

  circuitSpec.value.outputs.forEach(output => {
    output.columns.splice(rowIndex, 1);
  });
}

function fillAllRows() {
  //TODO
}

function removeAllRows() {
  circuitSpec.value.inputs.forEach(input => {
    input.columns = [];
  });

  circuitSpec.value.outputs.forEach(output => {
    output.columns = []
  });
}

function addInput() {
  circuitSpec.value.inputs.push({
    name: "?",
    columns: Array<Bit>(truthTableRows.value).fill("0")
  });

  saveCircuit();
}

function removeInput(index: number) {
  if (circuitSpec.value.inputs.length == 1) return;
  circuitSpec.value.inputs.splice(index, 1);

  circuitSpec.value.outputs.forEach((func) => {
    func.columns.splice(func.columns.length / 2);
  });

  saveCircuit();
}

// Output Table
type Bit = "0" | "1" | "X";

interface BitColumn {
  name: string;
  columns: Array<Bit>;
}

// Output Table
function addLogicFunction() {
  circuitSpec.value.outputs.push({
    name: "?",
    columns: Array<Bit>(truthTableRows.value).fill("0"),
  });

  saveCircuit();
}

function removeLogicFunction(index: number) {
  if (circuitSpec.value.outputs.length == 1) return;
  circuitSpec.value.outputs.splice(index, 1);

  saveCircuit();
}

function toggleBit(colIndex: number, rowIndex: number, isInputBit: boolean) {

  let value = isInputBit 
    ? circuitSpec.value.inputs[colIndex].columns[rowIndex - 1] 
    : circuitSpec.value.outputs[colIndex].columns[rowIndex - 1];

  let newValue = value == "0" ? "1" : (value == "1" ? "X" : "0");

  if (isInputBit) {
    circuitSpec.value.inputs[colIndex].columns[rowIndex - 1] = newValue as Bit;
  } else {
    circuitSpec.value.outputs[colIndex].columns[rowIndex - 1] = newValue as Bit;
  }

  saveCircuit();
}

// Results
const minimizedFunctions = computed(() => {
  // return circuitSpec.value.outputs.map((func) => {
  //   const minterms = new Set(
  //     func.outputs.reduce(
  //       (terms, bit, index) => (bit == "1" ? [...terms, index] : terms),
  //       [] as Array<number>
  //     )
  //   );
  //   const dontCares = new Set(
  //     func.outputs.reduce(
  //       (terms, bit, index) => (bit == "X" ? [...terms, index] : terms),
  //       [] as Array<number>
  //     )
  //   );
  //   return computeMcClusky(circuitSpec.value.inputs, minterms, dontCares);
  // });

  []
});

// Save / Load
interface CircuitSpec {
  inputs: Array<BitColumn>;
  outputs: Array<BitColumn>;
  name: string;
  id: string
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
    inputs: [
      {
        name: "S2",
        columns: new Array<Bit>("0"),
      },
      {
        name: "S1",
        columns: new Array<Bit>("0"),
      },
      {
        name: "S0",
        columns: new Array<Bit>("0"),
      },
    ],
    outputs: [
      {
        name: "F",
        columns: new Array<Bit>("0"),
      },
    ],
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
              <input @input="saveCircuit()" v-model="circuitSpec.inputs[index].name" />
            </div>
          </th>
          <th>
            <button class="add-button" @click="addInput">+</button>
          </th>
        </tr>
        <tr v-for="rowIndex in truthTableRows">
          <td
            class="bit"
            @click="toggleBit(colIndex, rowIndex, true)"
            v-for="(input, colIndex) in circuitSpec.inputs"
          >
            {{ input.columns[rowIndex - 1] }}
          </td>
        </tr>
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
        <tr v-for="rowIndex in truthTableRows">
          <td
            class="bit"
            @click="toggleBit(colIndex, rowIndex, false)"
            v-for="(func, colIndex) in circuitSpec.outputs"
          >
            {{ func.columns[rowIndex - 1] }}
          </td>
          <td>
            <button @click="removeTruthTableRow(rowIndex - 1)" class="remove-row-button">-</button>
          </td>
        </tr>
      </table>
    </div>

    <button class="add-row-button" @click="addTruthTableRow">Add Row</button>

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

.add-row-button {
  background-color: transparent;
  border: 1px solid white;
  margin-top: 1rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.164);
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
          color: white;
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

    .remove-row-button {
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;  

        transition: 0.3s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.164);
        }
      }

    .bit {
      text-align: center;
      user-select: none;
      cursor: pointer;
    }
  }
}
</style>
