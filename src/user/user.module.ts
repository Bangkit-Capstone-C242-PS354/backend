import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseModule } from '../firebase.module';
import { ExpenseModule } from '../expense/expense.module';
import { IncomeModule } from '../income/income.module';

@Module({
  imports: [
    FirebaseModule,
    forwardRef(() => ExpenseModule),
    forwardRef(() => IncomeModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
