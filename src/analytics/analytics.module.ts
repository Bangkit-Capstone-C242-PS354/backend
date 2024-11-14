import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ExpenseModule } from '../expense/expense.module';
import { IncomeModule } from '../income/income.module';
import { FirebaseModule } from 'src/firebase.module';

@Module({
  imports: [ExpenseModule, IncomeModule, FirebaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
