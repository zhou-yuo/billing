export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // ... (Your data validation logic here) ...

  // NEW: Call useDrizzle() to get the db instance for this request
  const db = useDrizzle()

  const [newTransaction] = await db.insert(tables.transactions).values({
    description: body.description,
    amount: body.amount,
    transactionDate: new Date(body.transactionDate),
    payerId: body.payerId,
    participants: body.participants,
    type: body.type,
    borrowerId: body.borrowerId,
    lenderId: body.lenderId,
    createdAt: new Date(),
  }).returning();

  return { status: 'success', data: newTransaction };
});