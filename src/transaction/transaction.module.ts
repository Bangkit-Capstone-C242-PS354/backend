import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { ExpenseModule } from '../expense/expense.module';
import { IncomeModule } from '../income/income.module';
import { FirebaseModule } from 'src/firebase.module';

@Module({
  imports: [FirebaseModule, ExpenseModule, IncomeModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
