// server/api/transactions/[id].delete.ts

import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // 1. 从 URL 中获取动态参数 [id]
  const transactionId = event.context.params?.id;

  // 2. 验证 ID 是否存在
  if (!transactionId) {
    // 设置 HTTP 状态码为 400 Bad Request
    setResponseStatus(event, 400);
    return {
      status: 400,
      msg: 'Transaction ID is required.',
    };
  }

  // 假设你的数据库 ID 是数字类型，需要将其从字符串转换为整数
  // 如果你的 ID 本来就是字符串类型（如 CUID 或 UUID），则不需要这步
  const parsedId = parseInt(transactionId, 10);
  if (isNaN(parsedId)) {
    setResponseStatus(event, 400);
    return {
      status: 400,
      msg: 'Invalid Transaction ID format. Must be a number.',
    };
  }

  try {
    const db = useDrizzle();

    // 3. 执行删除操作
    // .where(eq(...)) 告诉数据库只删除 ID 匹配的行
    // .returning({ id: ... }) 会返回被删除记录的ID，我们可以用它来确认是否真的删除了某些东西
    const deletedTransaction = await db
      .delete(tables.transactions)
      .where(eq(tables.transactions.id, parsedId))
      .returning({ id: tables.transactions.id });

    // 4. 检查是否有记录被删除
    // 如果返回的数组是空的，说明没有找到对应ID的记录
    if (deletedTransaction.length === 0) {
      setResponseStatus(event, 404); // 404 Not Found
      return {
        status: 404,
        msg: `Transaction with ID ${parsedId} not found.`,
      };
    }

    // 5. 返回成功响应
    // 成功时默认状态码是 200 OK，这里我们也可以明确返回一个成功消息
    return {
      status: 200,
      msg: `Transaction with ID ${parsedId} deleted successfully.`,
    };

  } catch (err) {
    console.error('Error deleting transaction:', err);
    setResponseStatus(event, 500); // 500 Internal Server Error
    return {
      status: 500,
      msg: `An error occurred while deleting the transaction.`,
    };
  }
});