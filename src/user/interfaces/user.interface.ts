import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  uid: string;
  email: string;
  username: string;
  password: string;
  totalExpense: number;
  totalIncome: number;
  totalBalance: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
