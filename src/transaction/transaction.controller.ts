import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../guard/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getUserTransactions(@Request() req) {
    return this.transactionService.getUserTransactions(req.user.uid);
  }
}
