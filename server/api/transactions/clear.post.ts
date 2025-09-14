// server/api/transactions/clear.post.ts

export default defineEventHandler(async (event) => {
  // 增加一层保护，比如检查是否是管理员或者特定环境变量，这里暂时省略
  // if (process.env.NODE_ENV === 'production') {
  //   setResponseStatus(event, 403); // Forbidden
  //   return { status: 403, msg: 'This action is disabled in production.' };
  // }

  try {
    // 1. 获取 Drizzle 实例
    const db = useDrizzle();

    // 2. 执行删除操作，不带 .where() 条件，这将删除表中的所有行
    await db.delete(tables.transactions);

    // 3. 返回成功的响应
    // 默认状态码为 200 OK
    return {
      status: 200,
      msg: '所有账单记录已清空',
    };

  } catch (err) {
    // 4. 处理可能发生的数据库错误
    console.error('Error clearing transactions table:', err);
    setResponseStatus(event, 500); // Internal Server Error
    return {
      status: 500,
      msg: '清空账单时发生服务器错误。',
    };
  }
});