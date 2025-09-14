export default defineEventHandler(async () => {
  const db = useDrizzle()
  const users = await db.select().from(tables.users)
  return users
})