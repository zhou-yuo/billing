// server/api/periods/index.get.ts

import { desc } from 'drizzle-orm';
import { getCurrentPeriod } from '~~/server/utils/period';

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    // 并发执行两个异步任务：从数据库查历史期数，从KV查当前期数
    const [dbPeriodObjects, currentPeriod] = await Promise.all([
      // 使用 selectDistinct() 来获取不重复的期数值
      db
        .selectDistinct({ period: tables.transactions.period })
        .from(tables.transactions)
        .orderBy(desc(tables.transactions.period)), // 按倒序排好
      
      getCurrentPeriod() // 获取当前期数
    ]);

    // 提取数据库中的期数
    const dbPeriods = dbPeriodObjects.map(p => p.period);

    // 合并并去重
    // 使用 Set 可以非常高效地将 KV 中的当前期数和数据库中的历史期数合并，并自动去重
    // 这可以防止当前期已经有账单时，列表里出现重复的期数
    const allPeriods = [...new Set([currentPeriod, ...dbPeriods])];

    // 最终排序，确保列表是降序的 (例如: [3, 2, 1])
    allPeriods.sort((a, b) => b - a);

    return {
      status: 200,
      msg: '成功获取所有期数列表',
      data: allPeriods
    };

  } catch (err) {
    console.error('Error fetching periods list:', err);
    setResponseStatus(event, 500);
    return {
      status: 500,
      msg: `获取期数列表时发生错误: ${err instanceof Error ? err.message : String(err)}`,
      data: []
    };
  }
});