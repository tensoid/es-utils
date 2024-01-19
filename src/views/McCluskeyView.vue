<script setup lang="ts">
import { ref, computed } from "vue";
import { computeMcClusky } from "../es-utils/mcclusky";

// Input Table
const inputs = ref(["S0", "S1", "S2"]);

const truthTableRows = computed(() => Math.pow(2, inputs.value.length));

function addInput() {
  inputs.value.push("?");

  outputs.value.forEach((func) => {
    func.outputs.push(...Array<OutputBit>(func.outputs.length).fill("0"));
  });
}

function removeInput(index: number) {
  if(inputs.value.length == 1) return;
  inputs.value.splice(index, 1);

  outputs.value.forEach((func) => {
    func.outputs.splice(func.outputs.length / 2);
  });
}

// Output Table
type OutputBit = "0" | "1" | "X";

interface LogicFunction {
  name: string;
  outputs: Array<OutputBit>;
}

const outputs = ref([] as Array<LogicFunction>);

outputs.value.push({
  name: "F",
  outputs: Array<OutputBit>(truthTableRows.value).fill("0"),
});

function addLogicFunction() {
  outputs.value.push({
    name: "?",
    outputs: Array<OutputBit>(truthTableRows.value).fill("0"),
  });
}

function removeLogicFunction(index: number) {
  if(outputs.value.length == 1) return;
  outputs.value.splice(index, 1);
}

function toggleBit(colIndex: number, rowIndex: number) {
  let value = outputs.value[colIndex].outputs[rowIndex - 1];
  if (value == "0") outputs.value[colIndex].outputs[rowIndex - 1] = "1";
  else if (value == "1") outputs.value[colIndex].outputs[rowIndex - 1] = "X";
  else outputs.value[colIndex].outputs[rowIndex - 1] = "0";
}

// Results
const minimizedFunctions = computed(() => {
  return outputs.value.map((func) => {
    const minterms = new Set(
      func.outputs.reduce(
        (terms, bit, index) => (bit == "1" ? [...terms, index] : terms),
        [] as Array<number>
      )
    );
    const dontCares = new Set(
      func.outputs.reduce(
        (terms, bit, index) => (bit == "X" ? [...terms, index] : terms),
        [] as Array<number>
      )
    );
    return computeMcClusky(inputs.value, minterms, dontCares);
  });
});
</script>

<template>
  <div class="tables">
    <table class="inputs-table">
      <tr>
        <th v-for="(_, index) in inputs">
          <div class="table-head">
            <button @click="removeInput(index)" class="remove-button">
              <svg width="20" height="20">
                <image href="@/assets/icons/cross.svg" />
              </svg>
            </button>
            <input v-model="inputs[index]" />
          </div>
        </th>
        <th>
          <button class="add-button" @click="addInput">+</button>
        </th>
      </tr>
      <tr v-for="rowIndex in truthTableRows">
        <td class="bit" v-for="colIndex in inputs.length">
          {{ ((rowIndex - 1) >> (inputs.length - colIndex)) & 1 }}
        </td>
      </tr>
    </table>

    <table class="outputs-table">
      <tr>
        <th v-for="(_, index) in outputs">
          <div class="table-head">
            <button @click="removeLogicFunction(index)" class="remove-button">
              <svg width="20" height="20">
                <image href="@/assets/icons/cross.svg" />
              </svg>
            </button>
            <input v-model="outputs[index].name" />
          </div>
        </th>
        <th>
          <button class="add-button" @click="addLogicFunction">+</button>
        </th>
      </tr>
      <tr v-for="rowIndex in truthTableRows">
        <td
          class="bit"
          @click="toggleBit(colIndex, rowIndex)"
          v-for="(func, colIndex) in outputs"
        >
          {{ func.outputs[rowIndex - 1] }}
        </td>
      </tr>
    </table>
  </div>

  <p v-for="(func, index) in minimizedFunctions">
    {{ outputs[index].name + ": " + func }}
  </p>
</template>

<style scoped lang="scss">
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

    .bit {
      text-align: center;
      user-select: none;
    }
  }
}
</style>
