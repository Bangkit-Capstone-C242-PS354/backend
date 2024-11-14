import { Timestamp } from 'firebase-admin/firestore';

export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  date: string | Date;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
