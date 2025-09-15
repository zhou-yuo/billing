/**
 * 获取当前的记账期数。
 * 如果 KV 存储中不存在，则初始化为第 1 期。
 * @returns {Promise<number>} 当前的期数
 */
export async function getCurrentPeriod(): Promise<number> {
  const storage = useStorage('kv');
  // 尝试从 KV 存储中获取 'current_period'
  const currentPeriod = await storage.getItem<number>('current_period');
  console.log("🚀 ~ getCurrentPeriod ~ currentPeriod:", currentPeriod)

  if (currentPeriod === null || typeof currentPeriod !== 'number') {
    // 如果不存在或格式不正确，则初始化为 1 并存入 KV
    await storage.setItem('current_period', 1);
    return 1;
  }
  
  return currentPeriod;
}

/**
 * 将记账期数增加 1。
 * 这应该在结算当前期后调用。
 * @returns {Promise<number>} 新的期数
 */
export async function incrementCurrentPeriod(): Promise<number> {
  const storage = useStorage('kv');
  const currentPeriod = await getCurrentPeriod(); // 获取当前期数
  const newPeriod = currentPeriod + 1;
  await storage.setItem('current_period', newPeriod);
  return newPeriod;
}