import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './interfaces/expense.interface';

@Injectable()
export class ExpenseService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async createExpense(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    const db = this.firebaseRepository.getFirestore();

    const expense: Expense = {
      userId,
      ...createExpenseDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('expenses').add(expense);
    return {
      id: docRef.id,
      ...expense,
    };
  }

  async getUserExpenses(userId: string): Promise<Expense[]> {
    const db = this.firebaseRepository.getFirestore();

    const snapshot = await db
      .collection('expenses')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Expense,
    );
  }
}
