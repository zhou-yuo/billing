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
    <div class="login-page-header">
      登录
    </div>
    <div class="login-container">
      <div class="login-img-box">
        <NuxtImg src="/images/login_img.png" alt="" class="login-img"></NuxtImg>
      </div>
      <div class="login-content">
        <p class="login-title">登录</p>
        <el-input v-model="inputId" class="w-full" placeholder="请输入账号" size="large" maxlength="20" @keyup.enter="handleLogin" />
        <el-button type="primary" class="login-btn" size="large" :loading="loginLoading" @click="handleLogin">登录</el-button>
      </div>
    </div>
    
  </div>
</template>

<style scoped lang="scss">

.login-page {
  height: 100vh;
  min-height: 0;
  justify-content: center;
  padding: 6vh 20px 15vh;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  //   background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  //   // background: linear-gradient(45deg, rgba(142, 197, 252, 1.000) 0.000%, rgba(141, 211, 255, 1.000) 25.000%, rgba(161, 216, 255, 1.000) 50.000%, rgba(193, 210, 255, 1.000) 75.000%, rgba(224, 195, 255, 1.000) 100.000%);
  
  //   z-index: -2; /* 将伪元素置于内容层之下 */
  // }
  .login-page-header {
    display: none;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    height: 56px;
    line-height: 56px;
    width: 100%;
  }
  @media screen and (max-width: 992px) {
    .login-page-header {
      display: block;
    }
  }
  .login-container {
    margin-top: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    overflow: hidden;
  }
  @media screen and (max-width: 992px) {
    .login-container {
      // flex: 1;
      // margin-top: 10vh;
      flex-direction: column;
      align-items: normal;
      justify-content: flex-end;
    }
  }
  .login-img {
    width: 50vw;
    height: 50vw;
    display: block;
    margin: 0;
    max-width: 600px;
    max-height: 600px;
  }
  @media screen and (max-width: 992px) {
    .login-img {
      margin: 0 auto;
      width: 70vw;
      height: 70vw;
    }
  }
  .login-content {
    background-color: var(--el-bg-color);
    border-radius: 10px;
    width: 420px;
    padding: 50px 20px 40px;
    box-shadow: var(--el-box-shadow);
  }
  @media screen and (max-width: 992px) {
    .login-content {
      width: auto;
      padding: 20px 10px;
      box-shadow: none;
    }
  }
  .login-title {
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  @media screen and (max-width: 992px) {
    .login-title {
      display: none;
      margin-bottom: 20px;
    }
  }
  .login-btn {
    display: block;
    width: 100%;
    margin-top: 32px;
    font-size: 16px;
  }
  @media screen and (max-width: 992px) {
    .login-btn {
      margin-top: 12px;
    }
  }
}
@media screen and (max-width: 992px) {
  .login-page {
    height: auto;
    min-height: 100vh;
    justify-content: space-around;
  }
}

</style>