import { Controller, Get, UseGuards, Request, Query, ValidationPipe, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../guard/auth.guard';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { Period } from 'src/analytics/interfaces/period.enum';
import { ExpenseService } from '../expense/expense.service';
import { CreateExpenseDto } from '../expense/dto/create-expense.dto';
import { FilterExpenseDto } from '../expense/dto/filter-expense.dto';
import { IncomeService } from '../income/income.service';
import { CreateIncomeDto } from '../income/dto/create-income.dto';
import { FilterIncomeDto } from '../income/dto/filter-income.dto';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getUserTransactions(
    @Request() req,
    @Query(ValidationPipe) filterDto: FilterTransactionDto,
  ) {
    if (filterDto.period === Period.CUSTOM && filterDto.startDate && filterDto.endDate) {
      return this.transactionService.getFilteredTransactions(
        req.user.uid,
        filterDto.startDate,
        filterDto.endDate,
      );
    }
    return this.transactionService.getUserTransactions(req.user.uid);
  }
}

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
  async getUserExpenses(
    @Request() req,
    @Query(ValidationPipe) filterDto: FilterExpenseDto,
  ) {
    if (filterDto.period === Period.CUSTOM && filterDto.startDate && filterDto.endDate) {
      return this.expenseService.getFilteredExpenses(
        req.user.uid,
        filterDto.startDate,
        filterDto.endDate,
      );
    }
    return this.expenseService.getUserExpenses(req.user.uid);
  }
}
@Controller('incomes')
@UseGuards(AuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async createIncome(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.createIncome(req.user.uid, createIncomeDto);
  }

  @Get()
  async getUserIncomes(
    @Request() req,
    @Query(ValidationPipe) filterDto: FilterIncomeDto,
  ) {
    if (filterDto.period === Period.CUSTOM && filterDto.startDate && filterDto.endDate) {
      return this.incomeService.getFilteredIncomes(
        req.user.uid,
        filterDto.startDate,
        filterDto.endDate,
      );
    }
    return this.incomeService.getUserIncomes(req.user.uid);
  }
}
