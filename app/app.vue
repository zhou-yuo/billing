<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

</script>
<template>
  <NuxtRouteAnnouncer />
  <el-config-provider :locale="zhCn">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>