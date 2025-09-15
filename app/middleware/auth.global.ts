// middleware/auth.global.ts

export default defineNuxtRouteMiddleware((to, from) => {
  // to.path 是用户将要跳转到的页面路径
  // 如果是去登录页，则直接放行
  if (to.path === '/login') {
    return;
  }

  // 使用我们创建的 useAuth Composable
  const { isLoggedIn, logout } = useAuth();

  // 如果用户未登录，则重定向到登录页
  if (!isLoggedIn.value) {
    // 使用 return navigateTo() 来中断导航并进行重定向
    logout(false)
    return navigateTo('/login');
  }
});