import type { TransactionType } from "~/types/record";

export const billingType: TransactionType[] = ['expense', 'loan', 'repayment']

// @账单类型 map expense-代付 loan-个人借款 repayment-个人还款
export const billingTypeMap: Record<TransactionType, string> = {
  'expense': '代付',
  'loan': '个人借款',
  'repayment': '个人还款',
}
