// server/database/schema.ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// 用户表 (虽然只有4个，但用表来管理更规范)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // 'user_a', 'user_b' ...
  name: text('name').notNull(), // 'A', 'B' ...
});

// 交易表
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  description: text('description').notNull(),
  amount: real('amount').notNull(), // real 用于存储浮点数
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  payerId: text('payer_id').notNull().references(() => users.id), // 外键，关联到用户表的id
  
  // 对于参与者，最规范的是用一个关联表 (many-to-many)
  // 但为了简化，对于固定4人的情况，可以直接存成 JSON 字符串
  participants: text('participants', { mode: 'json' }).$type<string[]>().notNull(),
  
  type: text('type', { enum: ['expense', 'loan', 'repayment'] }).notNull(),
  borrowerId: text('borrower_id').references(() => users.id),
  lenderId: text('lender_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});