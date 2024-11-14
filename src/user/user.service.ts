import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { ExpenseService } from '../expense/expense.service';
import { IncomeService } from '../income/income.service';
import { User } from './interfaces/user.interface';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class UserService {
  constructor(
    private readonly firebaseRepository: FirebaseRepository,
    @Inject(forwardRef(() => ExpenseService))
    private readonly expenseService: ExpenseService,
    @Inject(forwardRef(() => IncomeService))
    private readonly incomeService: IncomeService,
  ) {}

  async getUserData(userId: string): Promise<User> {
    const db = this.firebaseRepository.getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    return userDoc.data() as User;
  }

  async updateUserTotals(
    userId: string,
    amount: number,
    type: 'EXPENSE' | 'INCOME',
    operation: 'ADD' | 'SUBTRACT',
  ) {
    const db = this.firebaseRepository.getFirestore();
    const userRef = db.collection('users').doc(userId);

    const multiplier = operation === 'ADD' ? 1 : -1;
    const updateAmount = amount * multiplier;

    if (type === 'EXPENSE') {
      await userRef.update({
        totalExpense: FieldValue.increment(updateAmount),
        totalBalance: FieldValue.increment(-updateAmount),
        updatedAt: Timestamp.now(),
      });
    } else {
      await userRef.update({
        totalIncome: FieldValue.increment(updateAmount),
        totalBalance: FieldValue.increment(updateAmount),
        updatedAt: Timestamp.now(),
      });
    }
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    const db = this.firebaseRepository.getFirestore();

    // Check if username already exists
    const usernameDoc = await db
      .collection('users')
      .where('username', '==', username)
      .get();

    if (!usernameDoc.empty) {
      throw new ConflictException('Username already exists');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    await userRef.update({
      username,
      updatedAt: Timestamp.now(),
    });

    return {
      ...(userDoc.data() as User),
      username,
      updatedAt: Timestamp.now(),
    };
  }
}
