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
    receiptFile?: Express.Multer.File,
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

    let receiptUrl = oldExpense.receiptUrl;

    // Handle receipt file changes
    if (receiptFile || updateExpenseDto.receiptUrl === null) {
      // Delete old receipt if it exists
      if (oldExpense.receiptUrl) {
        try {
          const storageUrl = new URL(oldExpense.receiptUrl);
          const fullPath = storageUrl.pathname.split('/').slice(2).join('/');
          const filePath = decodeURIComponent(fullPath);

          await this.firebaseRepository.deleteFile(filePath);
          receiptUrl = null; // Clear the URL after successful deletion
        } catch (error) {
          console.error('Error deleting old receipt:', error);
          throw error;
        }
      }

      // Only upload new file if old file was successfully deleted or didn't exist
      if (receiptFile) {
        const filePath = `receipts/${userId}/${Date.now()}-${receiptFile.originalname}`;
        receiptUrl = await this.firebaseRepository.uploadFile(
          receiptFile,
          filePath,
        );
      }
    }

    // Convert amount from string to number if it exists
    if (updateExpenseDto.amount) {
      updateExpenseDto.amount = Number(updateExpenseDto.amount);
    }

    const updatedExpense = {
      ...updateExpenseDto,
      receiptUrl,
      updatedAt: Timestamp.now(),
    };

    // Remove undefined values from the update object
    Object.keys(updatedExpense).forEach(
      (key) => updatedExpense[key] === undefined && delete updatedExpense[key],
    );

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

    // Delete receipt file if it exists
    if (expense.receiptUrl) {
      try {
        const storageUrl = new URL(expense.receiptUrl);
        const fullPath = storageUrl.pathname.split('/').slice(2).join('/');
        const filePath = decodeURIComponent(fullPath);
        await this.firebaseRepository.deleteFile(filePath);
      } catch (error) {
        console.error('Error deleting receipt:', error);
        throw error;
      }
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

  async getFilteredExpenses(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Expense[]> {
    const db = this.firebaseRepository.getFirestore();

    const snapshot = await db
      .collection('expenses')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
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
}
