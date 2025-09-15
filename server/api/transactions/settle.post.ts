
// server/api/transactions/clear.post.ts

import { getCurrentPeriod, incrementCurrentPeriod } from "~~/server/utils/period";

export default defineEventHandler(async (event) => {
  // 增加一层保护，比如检查是否是管理员或者特定环境变量，这里暂时省略
  // if (process.env.NODE_ENV === 'production') {
  //   setResponseStatus(event, 403); // Forbidden
  //   return { status: 403, msg: 'This action is disabled in production.' };
  // }

  try {
    const settledByUid = getHeader(event, 'x-user-id');

    if (!settledByUid) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User ID is missing from headers.' });
    }
    
    //  获取 Drizzle 实例
    const db = useDrizzle();

    // 获取当前是第几期
    const currentPeriod = await getCurrentPeriod();

    // 执行删除操作，不带 .where() 条件，这将删除表中的所有行
    await db
      .update(tables.transactions)
      .set({
        status: 1, // 将状态更新为 1 (已结清)
        settledByUid: settledByUid, // 记录是谁结清的
      })
      .where(and(
        eq(tables.transactions.status, 0),
        eq(tables.transactions.period, currentPeriod)
      )); // 条件：只更新当前未结清的记录

    const newPeriod = await incrementCurrentPeriod();
    // 返回成功的响应
    // 默认状态码为 200 OK
    return {
      status: 200,
      msg: '第 ${currentPeriod} 期已成功结算！下一期是第 ${newPeriod} 期。',
    };

  } catch (err) {
    // 处理可能发生的数据库错误
    console.error('Error clearing transactions table:', err);
    setResponseStatus(event, 500); // Internal Server Error
    return {
      status: 500,
      msg: '清空账单时发生服务器错误。',
    };
  }
});