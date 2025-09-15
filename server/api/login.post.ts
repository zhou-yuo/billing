// server/api/login.post.ts

import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    // 1. 从请求体中获取 userId
    const body = await readBody(event);
    const userId = body.userId;

    // 2. 对传入的数据进行基础校验
    //    确保 userId 存在且是字符串
    if (!userId || typeof userId !== 'string') {
      // 使用 throw createError 来返回一个标准的 HTTP 错误
      // Nuxt/Nitro 会自动处理这个错误并返回正确的响应
      throw createError({
        statusCode: 400, // 400 Bad Request
        statusMessage: 'User ID is required and must be a string.',
      });
    }

    const db = useDrizzle();

    // 3. 在数据库的 users 表中查找是否存在匹配的 ID
    //    我们使用 .limit(1) 来优化查询，因为只要找到一个就足够了
    const foundUser = await db
      .select({
        id: tables.users.id,
        name: tables.users.name,
      })
      .from(tables.users)
      .where(eq(tables.users.id, userId))
      .limit(1);

    // 4. 根据查询结果返回不同的响应
    if (foundUser.length === 0) {
      // 如果返回的数组是空的，说明没有找到该用户
      throw createError({
        statusCode: 404, // 404 Not Found
        statusMessage: 'User not found. The provided User ID is invalid.',
      });
    } else {
      // 如果找到了用户，返回成功信息和用户信息
      // foundUser[0] 就是我们找到的那个用户对象
      return {
        status: 200,
        msg: 'Login successful',
        data: foundUser[0], // 返回用户的 id 和 name
      };
    }

  } catch (error: any) {
    // 5. 捕获所有可能发生的错误
    //    如果错误是我们主动抛出的 createError，它会保留原始的状态码
    //    如果是其他未知错误（如数据库连接失败），则会返回 500
    console.error('Login API error:', error);

    // 如果错误本身没有状态码，就设置为 500
    if (!error.statusCode) {
      error.statusCode = 500;
      error.statusMessage = 'An internal server error occurred during login.';
    }

    // 将错误信息重新抛出，让 Nitro 处理
    throw error;
  }
});