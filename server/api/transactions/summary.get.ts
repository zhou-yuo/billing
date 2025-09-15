// server/api/summary.get.ts
import { ApiResponse } from "~/types/apiResponse";

// 定义返回数据项的类型
interface UserSummary {
  id: string;
  name: string;
  balance: number;
}

export default defineEventHandler(
  async (): Promise<ApiResponse<UserSummary[] | []>> => {
    try {
      const db = useDrizzle();

      // 1. 并发查询所有交易 和 所有用户信息（ID 和 Name）
      const [allTransactions, allUsers] = await Promise.all([
        db.select().from(tables.transactions)
        // 只统计未结清的记录
        .where(eq(tables.transactions.status, 0)),
        db
          .select({
            id: tables.users.id,
            name: tables.users.name, // 确保 users 表有 name 字段
          })
          .from(tables.users),
      ]);

      // 2. 初始化一个以用户ID为键的余额记录对象
      const balances: Record<string, number> = {};
      allUsers.forEach((user) => {
        balances[user.id] = 0;
      });

      // 3. 遍历交易，计算每个ID的精确余额 (这部分逻辑保持不变)
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

      // 4. 构建并返回最终结果
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
        msg: `success`,
        data: summaryResult,
      };
    } catch (err) {
      return {
        status: 500,
        msg: `${err}`,
        data: [],
      };
    }
  }
);
