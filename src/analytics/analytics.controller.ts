import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../guard/auth.guard';
import { Period } from './interfaces/period.enum';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('analytics')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
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
    return {
      message: 'Expense analytics retrieved successfully',
      data: await this.analyticsService.getExpenseAnalytics(
        req.user.uid,
        period,
        year,
        month,
        week,
        startDate,
        endDate,
      ),
    };
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
    return {
      message: 'Income analytics retrieved successfully',
      data: await this.analyticsService.getIncomeAnalytics(
        req.user.uid,
        period,
        year,
        month,
        week,
        startDate,
        endDate,
      ),
    };
  }
}
