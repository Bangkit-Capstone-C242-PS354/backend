import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthGuard } from '../guard/auth.guard';

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(
    @Request() req,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.createExpense(req.user.uid, createExpenseDto);
  }

  @Get()
  async getUserExpenses(@Request() req) {
    return this.expenseService.getUserExpenses(req.user.uid);
  }

  @Get(':id')
  async getExpense(@Request() req, @Param('id') id: string) {
    return this.expenseService.getExpense(req.user.uid, id);
  }
}
