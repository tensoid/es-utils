<script setup lang="ts">

import init from '../../logics/target/logics-wasm-bindgen/logics.js'

init().catch((error) => {
  if (!error.message.startsWith("Using exceptions for control flow, don't mind me. This isn't actually an error!")) {
    throw error;
  }
});

</script>

<template>
  <div class="page-wrapper">
    <canvas id="logics-canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.page-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  
  canvas {
    height: 100% !important;
    width: 100% !important;
    outline: none;
  }
}
</style>
