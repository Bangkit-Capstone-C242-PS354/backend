import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
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

  @Put(':id')
  async updateExpense(
    @Request() req,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.updateExpense(
      req.user.uid,
      id,
      updateExpenseDto,
    );
  }

  @Delete(':id')
  async deleteExpense(@Request() req, @Param('id') id: string) {
    return this.expenseService.deleteExpense(req.user.uid, id);
  }
}
