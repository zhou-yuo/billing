// server/api/transactions/[id].delete.ts

import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // 从 URL 中获取动态参数 [id]

  try {
    const currentUserId = getHeader(event, 'x-user-id');
    if (!currentUserId) {
      throw createError({ statusCode: 400, statusMessage: '未授权：标头中缺少用户ID' });
    }
    
    const transactionId = event.context.params?.id;

    // 验证 ID 是否存在
    if (!transactionId) {
      // 设置 HTTP 状态码为 400 Bad Request
      throw createError({ statusCode: 400, statusMessage: 'ID 是必需的' });
    }

    // 假设你的数据库 ID 是数字类型，需要将其从字符串转换为整数
    // 如果你的 ID 本来就是字符串类型（如 CUID 或 UUID），则不需要这步
    const parsedId = parseInt(transactionId, 10);
    if (isNaN(parsedId)) {
      throw createError({ statusCode: 400, statusMessage: '无效的ID格式，必须是一个数字' });
    }
    
    const db = useDrizzle();

    //  执行删除操作
    // .where(eq(...)) 告诉数据库只删除 ID 匹配的行
    // .returning({ id: ... }) 会返回被删除记录的ID，我们可以用它来确认是否真的删除了某些东西
    const deletedTransaction = await db
      .delete(tables.transactions)
      .where(and(
        eq(tables.transactions.id, parsedId),
        eq(tables.transactions.creatorUid, currentUserId) 
      ))
      .returning({ id: tables.transactions.id });

    // 检查是否有记录被删除
    // 如果返回的数组是空的，说明没有找到对应ID的记录
    if (deletedTransaction.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '未找到交易ID' });
    }

    // 返回成功响应
    // 成功时默认状态码是 200 OK，这里我们也可以明确返回一个成功消息
    return {
      status: 200,
      msg: `删除成功`,
    };

  } catch (err) {
    throw createError({
      statusCode: 500, 
      statusMessage: `${err instanceof Error ? err.message : String(err)}`,
    });
  }
});