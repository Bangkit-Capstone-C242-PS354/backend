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
  Query,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthGuard } from '../guard/auth.guard';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Period } from 'src/analytics/interfaces/period.enum';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('expenses')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @HttpCode(201)
  async createExpense(
    @Request() req,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    const expense = await this.expenseService.createExpense(
      req.user.uid,
      createExpenseDto,
    );
    return {
      message: 'Expense created successfully',
      data: expense,
    };
  }

  @Get()
  async getUserExpenses(
    @Request() req,
    @Query(ValidationPipe) filterDto: FilterExpenseDto,
  ) {
    if (
      filterDto.period === Period.CUSTOM &&
      filterDto.startDate &&
      filterDto.endDate
    ) {
      const expenses = await this.expenseService.getFilteredExpenses(
        req.user.uid,
        filterDto.startDate,
        filterDto.endDate,
      );
      return {
        message: 'Filtered expenses retrieved successfully',
        data: expenses,
      };
    }
    const expenses = await this.expenseService.getUserExpenses(req.user.uid);
    return {
      message: 'Expenses retrieved successfully',
      data: expenses,
    };
  }

  @Get(':id')
  async getExpense(@Request() req, @Param('id') id: string) {
    const expense = await this.expenseService.getExpense(req.user.uid, id);
    return {
      message: 'Expense retrieved successfully',
      data: expense,
    };
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('receipt'))
  async updateExpense(
    @Request() req,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    receipt?: Express.Multer.File,
  ) {
    const expense = await this.expenseService.updateExpense(
      req.user.uid,
      id,
      updateExpenseDto,
      receipt,
    );
    return {
      message: 'Expense updated successfully',
      data: expense,
    };
  }

  @Delete(':id')
  async deleteExpense(@Request() req, @Param('id') id: string) {
    const result = await this.expenseService.deleteExpense(req.user.uid, id);
    return {
      message: result.message,
      data: { id: result.id },
    };
  }
}
