// server/api/transactions/index.get.ts
import { desc } from 'drizzle-orm'

// NEW: Import from our central utility file, including `desc` for sorting
export default defineEventHandler(async () => {
  // NEW: Call useDrizzle() to get the db instance
  const db = useDrizzle()

  // Using `tables.transactions` is cleaner than importing the schema directly
  const allTransactions = await db
    .select()
    .from(tables.transactions)
    .orderBy(desc(tables.transactions.createdAt)); // Order by newest first

  return allTransactions;
});