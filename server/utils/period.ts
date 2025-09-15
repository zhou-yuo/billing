/**
 * 获取当前的记账期数。
 * 如果 KV 存储中不存在，则初始化为第 1 期。
 * @returns {Promise<number>} 当前的期数
 */
const periodKey = 'current-period'

export async function getCurrentPeriod(): Promise<number> {
  const hasPeriod = await hubKV().has(periodKey)
  if(hasPeriod) {
    const hubkvPeriod = await hubKV().get<number>(periodKey);
    return hubkvPeriod!;
  } else {
    await hubKV().set(periodKey, 1);
    return 1;
  }
  // const storage = useStorage('database');
  // // 尝试从 KV 存储中获取 'current_period'
  // const currentPeriod = await storage.getItem<number>(periodKey);

  // if (currentPeriod === null || typeof currentPeriod !== 'number') {
  //   // 如果不存在或格式不正确，则初始化为 1 并存入 KV
  //   await storage.setItem(periodKey, 1);
  //   return 1;
  // }
  
  // return currentPeriod;
}

/**
 * 将记账期数增加 1。
 * 这应该在结算当前期后调用。
 * @returns {Promise<number>} 新的期数
 */
export async function incrementCurrentPeriod(): Promise<number> {
  // const storage = useStorage('database');
  // const currentPeriod = await getCurrentPeriod(); // 获取当前期数
  let currentPeriod = 1;
  const hasPeriod = await hubKV().has(periodKey)
  if(hasPeriod) {
    const hubkvPeriod = await hubKV().get<number>(periodKey);
    currentPeriod = hubkvPeriod!;
  }
  const newPeriod = currentPeriod + 1;
  // await storage.setItem(periodKey, newPeriod);
  await hubKV().set(periodKey, newPeriod);
  return newPeriod;
}