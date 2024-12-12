import { Injectable } from '@nestjs/common';
import { ExpenseService } from '../expense/expense.service';
import { IncomeService } from '../income/income.service';
import { Transaction } from './interfaces/transaction.interface';
import * as XLSX from 'xlsx';

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

  async getFilteredTransactions(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    const allTransactions = await this.getUserTransactions(userId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }

  async exportTransactions(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    // Get transactions
    let transactions = await this.getUserTransactions(userId);

    // Apply date filtering if dates are provided
    if (startDate && endDate) {
      transactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();

    // Convert transactions to worksheet data
    const worksheetData = transactions.map((transaction) => ({
      Date: transaction.date,
      Type: transaction.type,
      Title: transaction.title,
      Category: transaction.category,
      Amount: transaction.amount,
      Note: transaction.note || '',
      'Receipt URL':
        transaction.type === 'EXPENSE' ? transaction.receiptUrl || '' : '',
      Tax: transaction.type === 'EXPENSE' ? transaction.tax : '',
      'Payment Method':
        transaction.type === 'EXPENSE' ? transaction.paymentMethod || '' : '',
      'Created At': transaction.createdAt.toDate().toISOString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return excelBuffer;
  }
}
