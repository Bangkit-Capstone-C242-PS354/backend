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
  receiptUrl?: string;
  tax?: number;
  paymentMethod?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
