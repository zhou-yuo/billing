<script setup lang="ts">
import { ref } from "vue"
import type { ApiResponse } from "~/types/apiResponse";
import type { User } from "~/types/user";
const { $apiFetch } = useNuxtApp();

const { login } = useAuth();

definePageMeta({
  layout: 'blank'
})

const inputId = ref('')

const loginLoading = ref(false)
const handleLogin = async () => {
  if(!inputId.value) {
    ElMessage.warning('请输入账号')
    return
  }
  try {
    loginLoading.value = true
    const data = await $apiFetch<ApiResponse<User>>("login", {
      method: 'post',
      body: {
        userId: inputId.value
      }
    });
    console.log("🚀 ~ handleLogin ~ data:", data)
    login(inputId.value.trim());
  } catch (err) {
    ElMessage.warning('登录失败')
    console.error(err);
  } finally {
    loginLoading.value = false
  }
}

</script>

<template>
  <div class="login-page">
    <div class="login-content">
      <p class="login-title">登录</p>
      <el-input v-model="inputId" style="width: 100%" placeholder="请输入账号" size="large" maxlength="20" @keyup.enter="handleLogin" />
      <el-button type="primary" class="login-btn" size="large" :loading="loginLoading" @click="handleLogin">登录</el-button>
    </div>
  </div>
</template>

<style lang="scss">
.login-page {
  height: 100vh;
  width: 100vw;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  .login-content {
    background-color: var(--el-bg-color);
    padding: 20px;
    border-radius: 10px;
    box-shadow: var(--el-box-shadow);
    width: 100%;
    max-width: 400px;
  }
  .login-title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .login-btn {
    display: block;
    width: 100%;
    margin-top: 12px;
  }
}
  
</style>