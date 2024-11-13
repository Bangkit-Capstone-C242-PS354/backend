import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../guard/auth.guard';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses')
  async getExpenseAnalytics(@Query() getAnalyticsDto: GetAnalyticsDto) {
    return this.analyticsService.getExpenseAnalytics(getAnalyticsDto);
  }
} 