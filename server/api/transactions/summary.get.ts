// server/api/summary.get.ts
import { SQL } from "drizzle-orm";
import { billingType } from "~/constants/transactions";
import { ApiResponse } from "~/types/apiResponse";
import { TransactionType } from "~/types/record";
import { getCurrentPeriod } from "~~/server/utils/period";

// 定义返回数据项的类型
interface UserSummary {
  id: string;
  name: string;
  balance: number;
}

export default defineEventHandler(
  async (event): Promise<ApiResponse<UserSummary[] | []>> => {
    try {
      const query = getQuery(event);
      // 从查询参数中获取期数，并转换为数字
      const queryPeriod = query.period ? parseInt(query.period as string, 10) : null;
      const queryType = query.type as string | undefined;
      const queryStatus = query.status as number | undefined;
  
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

      // 结清状态：0 表示未结清，1 表示已结清。默认为 0
      if(queryStatus && !isNaN(queryStatus)) {
        conditions.push(eq(tables.transactions.status, queryStatus));
      }

      // 并发查询所有交易 和 所有用户信息（ID 和 Name）
      const [allTransactions, allUsers] = await Promise.all([
        db.select().from(tables.transactions)
        .where(and(...conditions)), // 只统计目标期数的账单

        db
          .select({
            id: tables.users.id,
            name: tables.users.name, // 确保 users 表有 name 字段
          })
          .from(tables.users),
      ]);

      // 初始化一个以用户ID为键的余额记录对象
      const balances: Record<string, number> = {};
      allUsers.forEach((user) => {
        balances[user.id] = 0;
      });

      // 遍历交易，计算每个ID的精确余额 (这部分逻辑保持不变)
      allTransactions.forEach((t) => {
        // 为确保健壮性，我们检查参与者是否存在于我们的用户列表中
        if (
          t.type === "expense" &&
          Array.isArray(t.participants) &&
          t.participants.length > 0
        ) {
          const share = t.amount / t.participants.length;
          const payerId = t.payerId.toString();
          if (balances[payerId] !== undefined) {
            balances[payerId] += t.amount;
          }
          t.participants.forEach((participantId: any) => {
            const pId = participantId.toString();
            if (balances[pId] !== undefined) {
              balances[pId] -= share;
            }
          });
        } else if (t.type === "loan" && t.lenderId && t.borrowerId) {
          const lenderId = t.lenderId.toString();
          const borrowerId = t.borrowerId.toString();
          if (balances[lenderId] !== undefined) balances[lenderId] += t.amount;
          if (balances[borrowerId] !== undefined)
            balances[borrowerId] -= t.amount;
        } else if (t.type === "repayment" && t.lenderId && t.borrowerId) {
          const borrowerId = t.borrowerId.toString();
          const lenderId = t.lenderId.toString();
          if (balances[borrowerId] !== undefined)
            balances[borrowerId] += t.amount;
          if (balances[lenderId] !== undefined) balances[lenderId] -= t.amount;
        }
      });

      // 构建并返回最终结果
      // 遍历 allUsers 数组（这是我们用户信息的“真实来源”）
      // 然后从 balances 对象中查找计算出的余额
      const summaryResult: UserSummary[] = allUsers.map((user) => {
        const rawBalance = balances[user.id]; // 此处 user.id 肯定存在于 balances 中

        return {
          id: user.id,
          name: user.name || "未知用户", // 如果数据库中 name 为 null，则提供备用名
          // 将余额四舍五入到两位小数
          balance: Math.round(rawBalance * 100) / 100,
        };
      });

      // return summaryResult;
      return {
        status: 200,
        msg: `成功统计第 ${targetPeriod} 期的收支`,
        data: summaryResult,
      };
    } catch (err) {
      throw createError({
        statusCode: 500,
        statusMessage: `${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
);
