import { Timestamp } from 'firebase-admin/firestore';

export interface Income {
  id?: string;
  userId: string;
  title: string;
  date: string;
  amount: number;
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
