// server/database/schema.ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// 用户表 (虽然只有4个，但用表来管理更规范)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // 'user_a', 'user_b' ...
  name: text('name').notNull(), // 'A', 'B'
});

// 交易表
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // 描述
  description: text('description').notNull(),
  // 金额
  amount: real('amount').notNull(), // real 用于存储浮点数
  // 付款人
  payerId: text('payer_id').notNull().references(() => users.id), // 外键，关联到用户表的id
  
  // 对于参与者，最规范的是用一个关联表 (many-to-many)
  // 但为了简化，对于固定人数的情况，可以直接存成 JSON 字符串
  participants: text('participants', { mode: 'json' }).$type<string[]>().notNull(),
  
  // 类型 'expense'-多人消费, 'loan'-个人借款, 'repayment'-个人还款
  type: text('type', { enum: ['expense', 'loan', 'repayment'] }).notNull(),
  borrowerId: text('borrower_id').references(() => users.id), // 还款人
  lenderId: text('lender_id').references(() => users.id), // 收款人

  // 创建人UID：记录这笔账是谁录入的
  creatorUid: text('creator_uid').notNull().references(() => users.id),
  // 结清状态：0 表示未结清，1 表示已结清。默认为 0
  status: integer('status').notNull().default(0),
  // 结清人UID：记录这笔账是谁操作结清的，默认为 NULL
  settledByUid: text('settled_by_uid').references(() => users.id),

  // 期数
  period: integer('period').notNull(),

  // 用户选择的时间
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});