export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.description || typeof body.description !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Description is required and must be a string.' });
  }
  if (!body.transactionDate || isNaN(new Date(body.transactionDate).getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'A valid transaction date is required.' });
  }
  if (!body.payerId) {
    throw createError({ statusCode: 400, statusMessage: 'Payer ID is required.' });
  }

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