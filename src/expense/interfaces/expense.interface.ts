export interface Expense {
  id?: string;
  userId: string;
  title: string;
  date: Date;
  amount: number;
  category: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
