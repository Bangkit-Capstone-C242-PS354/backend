import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { FirebaseModule } from 'src/firebase.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [FirebaseModule, TransactionModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
