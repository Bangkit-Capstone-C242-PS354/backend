import { Injectable, BadRequestException } from '@nestjs/common';
import { ExpenseService } from '../expense/expense.service';
import { CategoryAnalytics } from './interfaces/category-analytics.interface';
import { Period } from './interfaces/period.enum';
import { IncomeService } from '../income/income.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly incomeService: IncomeService,
  ) {}

  async getExpenseAnalytics(
    userId: string,
    period: Period,
    year?: number,
    month?: number,
    week?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CategoryAnalytics[]> {
    const dateRange = this.getDateRange(
      period,
      year,
      month,
      week,
      startDate,
      endDate,
    );
    const expenses = await this.expenseService.getUserExpenses(userId);

    const filteredExpenses = expenses.filter(
      (expense) =>
        expense.date >= dateRange.startDate &&
        expense.date <= dateRange.endDate,
    );

    const totalAmount = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    });

    const analytics: CategoryAnalytics[] = Array.from(
      categoryMap.entries(),
    ).map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((amount / totalAmount) * 100).toFixed(2)),
      totalAmount,
    }));

    return analytics.sort((a, b) => b.amount - a.amount);
  }

  async getIncomeAnalytics(
    userId: string,
    period: Period,
    year?: number,
    month?: number,
    week?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CategoryAnalytics[]> {
    const dateRange = this.getDateRange(
      period,
      year,
      month,
      week,
      startDate,
      endDate,
    );
    const incomes = await this.incomeService.getUserIncomes(userId);

    const filteredIncomes = incomes.filter(
      (income) =>
        income.date >= dateRange.startDate && income.date <= dateRange.endDate,
    );

    const totalAmount = filteredIncomes.reduce(
      (sum, income) => sum + income.amount,
      0,
    );

    const categoryMap = new Map<string, number>();
    filteredIncomes.forEach((income) => {
      const currentAmount = categoryMap.get(income.category) || 0;
      categoryMap.set(income.category, currentAmount + income.amount);
    });

    const analytics: CategoryAnalytics[] = Array.from(
      categoryMap.entries(),
    ).map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((amount / totalAmount) * 100).toFixed(2)),
      totalAmount,
    }));

    return analytics.sort((a, b) => b.amount - a.amount);
  }

  private getDateRange(
    period: Period,
    year?: number,
    month?: number,
    week?: number,
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case Period.WEEKLY:
        if (!week || !year) {
          // Current week if no week specified
          startDate = this.getStartOfCurrentWeek();
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        } else {
          if (week < 1 || week > 53) {
            throw new BadRequestException('Week must be between 1 and 53');
          }
          startDate = this.getStartOfWeek(targetYear, week);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        }
        break;

      case Period.MONTHLY:
        if (!month || !year) {
          // Current month if no month specified
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
          );
          endDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
          );
        } else {
          if (month < 1 || month > 12) {
            throw new BadRequestException('Month must be between 1 and 12');
          }
          startDate = new Date(targetYear, month - 1, 1);
          endDate = new Date(targetYear, month, 0);
        }
        break;

      case Period.ANNUALLY:
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear, 11, 31);
        break;

      case Period.CUSTOM:
        if (!customStartDate || !customEndDate) {
          throw new BadRequestException(
            'Start date and end date are required for custom period',
          );
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new BadRequestException('Invalid date format');
        }
        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  private getStartOfCurrentWeek(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  private getStartOfWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 1);
    const dayOffset = date.getDay();
    const firstMonday = 1 + ((8 - dayOffset) % 7);
    const weekOffset = (week - 1) * 7;
    date.setDate(firstMonday + weekOffset);
    return date;
  }
}
