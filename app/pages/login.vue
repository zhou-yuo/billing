<script setup lang="ts">
import { ref } from "vue"
const { login } = useAuth();
const router = useRouter();

definePageMeta({
  layout: 'blank'
})

const inputId = ref('')

const handleLogin = () => {
  if(!inputId.value) {
    ElMessage.warning('请输入账号')
    return
  }

  login(inputId.value.trim());

  // 2. 校验成功后，跳转到首页或用户之前想访问的页面
  router.push('/');
}

</script>

<template>
  <div class="login-page">
    <div class="login-content">
      <p class="login-title">登录</p>
      <el-input v-model="inputId" style="width: 100%" placeholder="请输入账号" size="large" maxlength="20"/>
      <el-button type="primary" class="login-btn" size="large" @click="handleLogin">登录</el-button>
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