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
    const userId = inputId.value.trim();
    const data = await $apiFetch<ApiResponse<User>>("login", {
      method: 'post',
      body: {
        userId
      }
    });
    login(userId);
  } catch (err) {
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
  position: relative;
  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
    
  //   background-image: url('/svg/pattern-30.svg');
  //   opacity: 0.1; /* 在这里设置背景的透明度 */
  //   z-index: -1; /* 将伪元素置于内容层之下 */
  // }
  // &::after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   background: linear-gradient(45deg, rgba(142, 197, 252, 1.000) 0.000%, rgba(141, 211, 255, 1.000) 25.000%, rgba(161, 216, 255, 1.000) 50.000%, rgba(193, 210, 255, 1.000) 75.000%, rgba(224, 195, 255, 1.000) 100.000%);
  
  //   z-index: -2; /* 将伪元素置于内容层之下 */
  // }
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