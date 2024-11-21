import { Module, forwardRef } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { FirebaseModule } from '../firebase.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [FirebaseModule, forwardRef(() => UserModule)],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
