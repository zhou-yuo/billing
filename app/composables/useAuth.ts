// composables/useAuth.ts

export const useAuth = () => {
  // 创建一个响应式的 cookie，名为 'user-id'
  // maxAge: 7200 秒 = 2 小时
  const userId = useCookie<string | null>('user-id', { maxAge: 7200 });

  // 登录函数：设置 cookie 值
  const login = (id: string) => {
    if (!id) return;
    userId.value = id;
  };

  // 登出函数：清除 cookie
  const logout = () => {
    userId.value = null;
    navigateTo('/login');
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