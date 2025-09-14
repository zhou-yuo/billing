export interface Transaction {
  id: number;
  amount: number;
  participants: string[];
  description: string;
  transactionDate: string;
  [key: string]: any;
}

export interface Summary {
  id: string;
  name: string;
  balance: number;
}