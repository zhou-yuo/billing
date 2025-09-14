// server/api/transactions/index.get.ts
import { desc } from 'drizzle-orm'

// NEW: Import from our central utility file, including `desc` for sorting
export default defineEventHandler(async () => {

  try {
     // NEW: Call useDrizzle() to get the db instance
    const db = useDrizzle()

    // Using `tables.transactions` is cleaner than importing the schema directly
    const allTransactions = await db
      .select()
      .from(tables.transactions)
      .orderBy(desc(tables.transactions.createdAt)); // Order by newest first

    return {
      status: 200,
      msg: `success`,
      data: allTransactions
    }
  } catch(err) {
    return {
      status: 500,
      msg: `${err}`,
    }
  }
});