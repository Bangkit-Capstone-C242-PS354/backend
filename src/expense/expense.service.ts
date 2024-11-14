import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './interfaces/expense.interface';
import { DeleteResponse } from './interfaces/delete-response.interface';
import { Timestamp } from 'firebase-admin/firestore';

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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Expense,
    );
  }

  async getExpense(userId: string, expenseId: string): Promise<Expense> {
    const db = this.firebaseRepository.getFirestore();

    const docRef = await db.collection('expenses').doc(expenseId).get();

    if (!docRef.exists) {
      throw new NotFoundException('Expense not found');
    }

    const expense = docRef.data() as Expense;

    if (expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    return {
      id: docRef.id,
      ...expense,
    };
  }

  async updateExpense(
    userId: string,
    expenseId: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const db = this.firebaseRepository.getFirestore();
    const docRef = db.collection('expenses').doc(expenseId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Expense not found');
    }

    const expense = doc.data() as Expense;
    if (expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    const updatedExpense = {
      ...updateExpenseDto,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatedExpense);

    return {
      id: expenseId,
      ...expense,
      ...updatedExpense,
    };
  }

  async deleteExpense(
    userId: string,
    expenseId: string,
  ): Promise<DeleteResponse> {
    const db = this.firebaseRepository.getFirestore();
    const docRef = db.collection('expenses').doc(expenseId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Expense not found');
    }

    const expense = doc.data() as Expense;
    if (expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    await docRef.delete();

    return {
      message: 'Expense deleted successfully',
      id: expenseId,
    };
  }
}
