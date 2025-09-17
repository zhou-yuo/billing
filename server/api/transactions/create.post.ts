import { getCurrentPeriod } from "~~/server/utils/period";

export default defineEventHandler(async (event) => {
  try {
    const creatorUid = getHeader(event, 'x-user-id');

    // 2. 增加对操作人ID的校验
    if (!creatorUid) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User ID is missing from headers.' });
    }

    const body = await readBody(event);

    if (!body.amount) {
      throw createError({ statusCode: 400, statusMessage: 'Amount is required.' });
    }

    if (!body.type) {
      throw createError({ statusCode: 400, statusMessage: 'Type is required.' });
    }

    if (!body.payerId) {
      throw createError({ statusCode: 400, statusMessage: 'Payer ID is required.' });
    }

    if (!body.participants || !body.participants.length) {
      throw createError({ statusCode: 400, statusMessage: 'Participants is required.' });
    }

    if (!body.description || typeof body.description !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Description is required and must be a string.' });
    }
    if (!body.transactionDate || isNaN(new Date(body.transactionDate).getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'A valid transaction date is required.' });
    }
    

    // NEW: Call useDrizzle() to get the db instance for this request
    const db = useDrizzle()

    // 获取当前期数 
    const currentPeriod = await getCurrentPeriod();

    const [newTransaction] = await db.insert(tables.transactions).values({
      description: body.description,
      amount: body.amount,
      transactionDate: new Date(body.transactionDate),
      payerId: body.payerId,
      participants: body.participants,
      type: body.type,
      borrowerId: body.borrowerId,
      lenderId: body.lenderId,
      creatorUid: creatorUid, // 从 header 获取
      status: 0,             // 默认状态为 0 (未结清)
      settledByUid: null,    // 结清人默认为 null
      period: currentPeriod,  // 设置期数字段
      createdAt: new Date(),
    }).returning();

    return { 
      status: 200,
      msg: 'success',
      data: newTransaction
    };
  } catch(err) {
    throw createError({
      statusCode: 500,
      statusMessage: `${err instanceof Error ? err.message : String(err)}`,
    });
  }
});