export interface Transaction {
  id: number;
  amount: number;
  description: string;
  [key: string]: string | number;
}