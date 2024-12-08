import { Timestamp } from 'firebase-admin/firestore';

export interface Expense {
  id?: string;
  userId: string;
  title: string;
  date: string;
  amount: number;
  category: string;
  note?: string;
  receiptUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
