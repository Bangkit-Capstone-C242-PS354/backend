import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { GetAnalyticsDto, PeriodType } from './dto/get-analytics.dto';
import { AnalyticsResponse, CategoryAnalytics } from './interfaces/analytics-response.interface';

@Injectable()
export class AnalyticsService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async getExpenseAnalytics(getAnalyticsDto: GetAnalyticsDto): Promise<AnalyticsResponse> {
    const { periodType, startDate, endDate } = getAnalyticsDto;
    const db = this.firebaseRepository.getFirestore();
    let query = db.collection('expenses');

    // Add date filters based on period type
    const dateFilters = this.getDateFilters(periodType, startDate, endDate);
    
    // Remove userId filter, only keep date filters
    const filteredQuery = query
        .where('date', '>=', dateFilters.startDate)
        .where('date', '<=', dateFilters.endDate);

    const snapshot = await filteredQuery.get();
    const expenses = snapshot.docs.map(doc => doc.data());

    // Calculate totals by category
    const categoryTotals = new Map<string, number>();
    let periodTotal = 0;

    expenses.forEach(expense => {
      const amount = expense.amount || 0;
      const category = expense.category;
      
      categoryTotals.set(
        category,
        (categoryTotals.get(category) || 0) + amount
      );
      periodTotal += amount;
    });

    // Calculate percentages and format response
    const data: CategoryAnalytics[] = Array.from(categoryTotals.entries())
      .map(([category, total]) => ({
        category,
        total,
        percentage: periodTotal > 0 ? (total / periodTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      data,
      periodTotal,
    };
  }

  private getDateFilters(periodType: PeriodType, startDate?: string, endDate?: string) {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (periodType) {
      case PeriodType.WEEKLY:
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case PeriodType.MONTHLY:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case PeriodType.ANNUALLY:
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case PeriodType.CUSTOM:
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        break;
    }

    return {
      startDate: start,
      endDate: end,
    };
  }
} 