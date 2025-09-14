// server/middleware/auth.ts

import { eq } from 'drizzle-orm';

// 注意：中间件现在是 async 的，因为我们需要等待数据库查询
export default defineEventHandler(async (event) => {
  const path = event.path;

  // 1. 过滤掉非 API 请求或公共 API
  if (!path.startsWith('/api/')) {
    return;
  }
  const publicApiRoutes = ['/api/public-info']; // 白名单
  if (publicApiRoutes.includes(path)) {
    return;
  }

  // 2. 从请求头中获取 x-user-id
  const userId = getHeader(event, 'x-user-id');

  // 3. 检查请求头是否存在
  if (!userId) {
    setResponseStatus(event, 401);
    return {
      status: 401,
      msg: 'Unauthorized: Missing x-user-id header.',
    };
  }

  try {
    // 4. (核心改动) 查询数据库验证用户是否存在
    const db = useDrizzle();
    
    // 我们只需要知道用户是否存在，所以只查询 id 字段即可，效率更高
    const userExists = await db
      .select({ id: tables.users.id })
      .from(tables.users)
      .where(eq(tables.users.id, userId)); // 使用 eq() 进行精确匹配

    // 5. 如果查询结果为空数组，说明数据库中没有这个用户
    if (userExists.length === 0) {
      setResponseStatus(event, 403); // 403 Forbidden 是更准确的状态码
      return {
        status: 403,
        msg: 'Forbidden: Invalid User ID. This user does not exist.',
      };
    }

    // 6. 验证通过，将 userId 存入上下文，供后续 API 使用
    event.context.userId = userId;

  } catch (error) {
    // 捕获数据库查询过程中可能发生的错误
    console.error('Database validation error in auth middleware:', error);
    setResponseStatus(event, 500);
    return {
      status: 500,
      msg: 'Internal Server Error during authentication.',
    };
  }
});