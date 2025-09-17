export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task'
  },
  async run() {
    console.log('Running DB seed task...')
    try {
      const users = [
        { id: 'ziLong', name: '子龙' },
        { id: 'siMaYi', name: '司马懿' },
        { id: 'huangZhong', name: '黄忠' },
        { id: 'zhouYu', name: '周瑜' },
      ];
    
      await useDrizzle().insert(tables.users).values(users)
      return { result: 'success' }
    } catch(err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
})