import { Module, forwardRef } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { FirebaseModule } from '../firebase.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [FirebaseModule, forwardRef(() => UserModule)],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
