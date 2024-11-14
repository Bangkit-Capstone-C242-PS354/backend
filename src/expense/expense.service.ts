import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './interfaces/expense.interface';
import { DeleteResponse } from './interfaces/delete-response.interface';
import { Timestamp } from 'firebase-admin/firestore';
import { UserService } from '../user/user.service';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly firebaseRepository: FirebaseRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

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

    // Update user totals
    await this.userService.updateUserTotals(
      userId,
      expense.amount,
      'EXPENSE',
      'ADD',
    );

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

    const oldExpense = doc.data() as Expense;
    if (oldExpense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    const updatedExpense = {
      ...updateExpenseDto,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatedExpense);

    // Update user totals if amount changed
    if (
      updateExpenseDto.amount &&
      updateExpenseDto.amount !== oldExpense.amount
    ) {
      await this.userService.updateUserTotals(
        userId,
        oldExpense.amount,
        'EXPENSE',
        'SUBTRACT',
      );
      await this.userService.updateUserTotals(
        userId,
        updateExpenseDto.amount,
        'EXPENSE',
        'ADD',
      );
    }

    return {
      id: expenseId,
      ...oldExpense,
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

    // Update user totals
    await this.userService.updateUserTotals(
      userId,
      expense.amount,
      'EXPENSE',
      'SUBTRACT',
    );

    return {
      message: 'Expense deleted successfully',
      id: expenseId,
    };
  }
}
