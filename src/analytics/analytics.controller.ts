import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../guard/auth.guard';
import { Period } from './interfaces/period.enum';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses')
  async getExpenseAnalytics(
    @Request() req,
    @Query('period') period: Period = Period.MONTHLY,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('week') week?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getExpenseAnalytics(
      req.user.uid,
      period,
      year,
      month,
      week,
      startDate,
      endDate,
    );
  }

  @Get('incomes')
  async getIncomeAnalytics(
    @Request() req,
    @Query('period') period: Period = Period.MONTHLY,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('week') week?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getIncomeAnalytics(
      req.user.uid,
      period,
      year,
      month,
      week,
      startDate,
      endDate,
    );
  }
}
