import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { FirebaseModule } from '../firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
