import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { Income } from './interfaces/income.interface';

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
      createdAt: new Date(),
      updatedAt: new Date(),
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
