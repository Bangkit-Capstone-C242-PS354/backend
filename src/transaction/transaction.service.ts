import { Injectable } from '@nestjs/common';
import { ExpenseService } from '../expense/expense.service';
import { IncomeService } from '../income/income.service';
import { Transaction } from './interfaces/transaction.interface';

@Injectable()
export class TransactionService {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly incomeService: IncomeService,
  ) {}

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const [expenses, incomes] = await Promise.all([
      this.expenseService.getUserExpenses(userId),
      this.incomeService.getUserIncomes(userId),
    ]);

    const expenseTransactions: Transaction[] = expenses.map((expense) => ({
      ...expense,
      type: 'EXPENSE' as const,
    }));

    const incomeTransactions: Transaction[] = incomes.map((income) => ({
      ...income,
      type: 'INCOME' as const,
      note: undefined,
    }));

    const allTransactions = [...expenseTransactions, ...incomeTransactions];

    // Sort by date first, then by createdAt as tiebreaker
    return allTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      // If dates are different, sort by date
      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // Convert Timestamp to Date for comparison
      const createTimeA = a.createdAt.toDate().getTime();
      const createTimeB = b.createdAt.toDate().getTime();
      return createTimeB - createTimeA;
    });
  }
}
