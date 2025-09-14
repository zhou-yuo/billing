<script setup lang="ts">
import { ref } from "vue"

</script>

<template>
  <div class="page-header">
    <div class="page-header-main">
      Billing
    </div>
    <div class="page-header-placeholder"></div>
  </div>
</template>

<style lang="scss">
.page-header {
  $page-header-header: 44px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  .page-header-main,
  .page-header-placeholder {
    height: $page-header-header;
    line-height: $page-header-header;
  }
  .page-header-main {
    background-color: var(--el-fill-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;
  }
}
</style>