// server/api/transactions/index.get.ts
import { desc, SQL } from 'drizzle-orm';
import { getCurrentPeriod } from '~~/server/utils/period';
import { billingType } from '~/constants/transactions';
import type { TransactionType } from "~/types/record";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    // 从查询参数中获取期数，并转换为数字
    const queryPeriod = query.period ? parseInt(query.period as string, 10) : null;
    const queryType = query.type as string | undefined;

    const db = useDrizzle();

    // 决定要查询的期数
    // 如果前端传了期数，就用它；否则，就去获取当前最新期数
    const targetPeriod = queryPeriod || await getCurrentPeriod();
    
    // 检查 targetPeriod 是否有效
    if (isNaN(targetPeriod)) {
      throw createError({ statusCode: 400, statusMessage: '无效期数格式' });
    }

    // 存放所有查询条件
    const conditions: (SQL | undefined)[] = [];

    // 添加必须的 period 条件
    conditions.push(eq(tables.transactions.period, targetPeriod));

    if (queryType && billingType.includes(queryType as any)) {
      // 如果 queryType 存在且是预定义的合法类型之一，才添加此筛选条件
      // 使用类型断言，因为我们已经用 .includes() 检查过了
      conditions.push(eq(tables.transactions.type, queryType as TransactionType));
    }

    // 并发查询所有交易记录 和 所有用户信息
    const [allTransactions, allUsers] = await Promise.all([
      db
        .select()
        .from(tables.transactions)
        // 查询特定期数的记录
        .where(and(...conditions))
        .orderBy(desc(tables.transactions.createdAt)), // 按最新时间排序
      
      db
        .select({ id: tables.users.id, name: tables.users.name })
        .from(tables.users)
    ]);

    // 2. 创建一个从 userID 到 userName 的快速查找映射表
    const userMap = allUsers.reduce((acc, user) => {
      acc[user.id] = user.name || '未知用户';
      return acc;
    }, {} as Record<string, string>);

    // 3. 遍历交易列表，添加 name 字段
    const transformedTransactions = allTransactions.map(t => {
      // 将 participants 数组中的 ID 转换为 Name 数组
      const participantsNames = Array.isArray(t.participants) 
        ? t.participants.map((pId: any) => userMap[pId.toString()] || '未知用户')
        : [];

      // 返回一个新的对象，包含所有原始信息，并附加转换后的 name
      // 这样做比直接替换ID更好，因为前端有时可能仍需要ID
      return {
        ...t, // 保留所有原始交易字段
        settledByName: t.settledByUid ? userMap[t.settledByUid.toString()] : null,
        creatorName: userMap[t.creatorUid.toString()] || '未知用户',
        payerName: userMap[t.payerId.toString()] || '未知用户',
        lenderName: t.lenderId ? userMap[t.lenderId.toString()] : null,
        borrowerName: t.borrowerId ? userMap[t.borrowerId.toString()] : null,
        participantsNames: participantsNames,
      };
    });

    return {
      status: 200,
      msg: `成功查询第 ${targetPeriod} 期的记录`,
      data: transformedTransactions // 4. 返回转换后的数据
    };
  } catch (err) {
    throw createError({
      statusCode: 500, 
      statusMessage: `${err instanceof Error ? err.message : String(err)}`,
    });
  }
});