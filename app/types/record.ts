export type TransactionType = 'expense' | 'loan' | 'repayment';
export type TransactionStatus = 0 | 1;

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  payerId: string;
  payerName: string;
  participants: string[];
  participantsNames: string[];
  type: TransactionType;
  borrowerId: string | null,
  borrowerName: string | null,
  lenderId: string | null,
  lenderName: string | null;
  creatorUid: string;
  creatorName: string;
  status: TransactionStatus;
  settledByUid: string;
  transactionDate: string;
  createdAt: string;
  [key: string]: any;
}

export interface Summary {
  id: string;
  name: string;
  balance: number;
}