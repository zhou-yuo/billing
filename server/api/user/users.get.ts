export default defineEventHandler(async () => {
  try {
    const db = useDrizzle()
    const users = await db.select().from(tables.users)
    return {
      status: 200,
      msg: `success`,
      data: users
    }
  } catch(err) {
    throw createError({
      statusCode: 500, 
      statusMessage: `${err instanceof Error ? err.message : String(err)}`,
    });
  }
})