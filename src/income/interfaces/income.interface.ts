export interface Income {
  id?: string;
  userId: string;
  title: string;
  date: string;
  amount: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
