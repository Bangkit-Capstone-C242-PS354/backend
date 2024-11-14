import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    FirebaseModule,
    AuthModule,
    ExpenseModule,
    IncomeModule,
    TransactionModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
