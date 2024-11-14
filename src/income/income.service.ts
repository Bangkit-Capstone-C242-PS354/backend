import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income } from './interfaces/income.interface';
import { DeleteResponse } from './interfaces/delete-response.interface';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class IncomeService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

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

    // Verify that the income belongs to the requesting user
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

    const income = doc.data() as Income;
    if (income.userId !== userId) {
      throw new NotFoundException('Income not found');
    }

    const updatedIncome = {
      ...updateIncomeDto,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatedIncome);

    return {
      id: incomeId,
      ...income,
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

    await docRef.delete();

    return {
      message: 'Income deleted successfully',
      id: incomeId,
    };
  }
}
