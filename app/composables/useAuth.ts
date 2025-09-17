// composables/useAuth.ts

export const useAuth = () => {
  // 创建一个响应式的 cookie，名为 'user-id'
  // maxAge: 600 秒 = 10 分钟
  const userId = useCookie<string | null>('user-id', { maxAge: 600 });

  // 登录函数：设置 cookie 值
  const login = (id: string) => {
    if (!id) return;
    userId.value = id;
    navigateTo('/', { replace: true })
  };

  // 登出函数：清除 cookie
  const logout = (toLoginPage: boolean = true) => {
    userId.value = null;
    if(toLoginPage) {
      navigateTo('/login', { replace: true })
    }
  };

  // 计算属性，方便判断是否已登录
  const isLoggedIn = computed(() => !!userId.value);

  return {
    userId,
    isLoggedIn,
    login,
    logout,
  };
};