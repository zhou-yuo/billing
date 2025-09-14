// server/plugins/seed.ts

export default defineNitroPlugin(async (nitroApp) => {
  // 我们只在开发环境中运行 seed，避免在生产环境中意外执行
  if (!import.meta.dev) {
    return;
  }

  console.log('Nitro plugin: Seeding database...');

  // 1. 定义你的固定用户数据
  const usersToSeed = [
    { id: 'ziLong', name: '子龙' },
    { id: 'siMaYi', name: '司马懿' },
    { id: 'huangZhong', name: '黄忠' },
    { id: 'zhouYu', name: '周瑜' },
  ];

  const db = useDrizzle();

  // 2. 检查用户是否已经存在，让这个操作“幂等”
  // “幂等”意味着无论你运行多少次，结果都是一样的，不会重复创建用户
  const existingUsers = await db.select({ id: tables.users.id }).from(tables.users).limit(1);

  if (existingUsers.length > 0) {
    console.log('Users already exist. Skipping seed.');
    return; // 如果已有用户，就直接退出
  }

  // 3. 如果数据库是空的，就插入数据
  try {
    await db.insert(tables.users).values(usersToSeed);
    console.log('✅ Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
});