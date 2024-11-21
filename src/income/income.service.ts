import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income } from './interfaces/income.interface';
import { DeleteResponse } from './interfaces/delete-response.interface';
import { Timestamp } from 'firebase-admin/firestore';
import { UserService } from '../user/user.service';

@Injectable()
export class IncomeService {
  constructor(
    private readonly firebaseRepository: FirebaseRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createIncome(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Income> {
    const db = this.firebaseRepository.getFirestore();

    const income: Income = {
      userId,
      ...createIncomeDto,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection('incomes').add(income);

    // Update user totals
    await this.userService.updateUserTotals(
      userId,
      income.amount,
      'INCOME',
      'ADD',
    );

    return {
      id: docRef.id,
      ...income,
    };
  }

  async getUserIncomes(userId: string): Promise<Income[]> {
    const db = this.firebaseRepository.getFirestore();

    const snapshot = await db
      .collection('incomes')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Income,
    );
  }

  async getIncome(userId: string, incomeId: string): Promise<Income> {
    const db = this.firebaseRepository.getFirestore();

    const docRef = await db.collection('incomes').doc(incomeId).get();

    if (!docRef.exists) {
      throw new NotFoundException('Income not found');
    }

    const income = docRef.data() as Income;

    if (income.userId !== userId) {
      throw new NotFoundException('Income not found');
    }

    return {
      id: docRef.id,
      ...income,
    };
  }

  async updateIncome(
    userId: string,
    incomeId: string,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<Income> {
    const db = this.firebaseRepository.getFirestore();
    const docRef = db.collection('incomes').doc(incomeId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Income not found');
    }

    const oldIncome = doc.data() as Income;
    if (oldIncome.userId !== userId) {
      throw new NotFoundException('Income not found');
    }

    const updatedIncome = {
      ...updateIncomeDto,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatedIncome);

    // Update user totals if amount changed
    if (updateIncomeDto.amount && updateIncomeDto.amount !== oldIncome.amount) {
      await this.userService.updateUserTotals(
        userId,
        oldIncome.amount,
        'INCOME',
        'SUBTRACT',
      );
      await this.userService.updateUserTotals(
        userId,
        updateIncomeDto.amount,
        'INCOME',
        'ADD',
      );
    }

    return {
      id: incomeId,
      ...oldIncome,
      ...updatedIncome,
    };
  }

  async deleteIncome(
    userId: string,
    incomeId: string,
  ): Promise<DeleteResponse> {
    const db = this.firebaseRepository.getFirestore();
    const docRef = db.collection('incomes').doc(incomeId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Income not found');
    }

    const income = doc.data() as Income;
    if (income.userId !== userId) {
      throw new NotFoundException('Income not found');
    }

    // Update user totals before deleting
    await this.userService.updateUserTotals(
      userId,
      income.amount,
      'INCOME',
      'SUBTRACT',
    );

    await docRef.delete();

    return {
      message: 'Income deleted successfully',
      id: incomeId,
    };
  }

  async getFilteredIncomes(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Income[]> {
    const db = this.firebaseRepository.getFirestore();
    
    const snapshot = await db
      .collection('incomes')
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
        }) as Income,
    );
  }
}
