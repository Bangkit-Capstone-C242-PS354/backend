import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  Request,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '../guard/auth.guard';
import { FilterIncomeDto } from './dto/filter-income.dto';
import { Period } from 'src/analytics/interfaces/period.enum';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('incomes')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async createIncome(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    const income = await this.incomeService.createIncome(
      req.user.uid,
      createIncomeDto,
    );
    return {
      message: 'Income created successfully',
      data: income,
    };
  }

  @Get()
  async getUserIncomes(
    @Request() req,
    @Query(ValidationPipe) filterDto: FilterIncomeDto,
  ) {
    if (
      filterDto.period === Period.CUSTOM &&
      filterDto.startDate &&
      filterDto.endDate
    ) {
      const incomes = await this.incomeService.getFilteredIncomes(
        req.user.uid,
        filterDto.startDate,
        filterDto.endDate,
      );
      return {
        message: 'Filtered incomes retrieved successfully',
        data: incomes,
      };
    }
    const incomes = await this.incomeService.getUserIncomes(req.user.uid);
    return {
      message: 'Incomes retrieved successfully',
      data: incomes,
    };
  }

  @Get(':id')
  async getIncome(@Request() req, @Param('id') id: string) {
    const income = await this.incomeService.getIncome(req.user.uid, id);
    return {
      message: 'Income retrieved successfully',
      data: income,
    };
  }

  @Put(':id')
  async updateIncome(
    @Request() req,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    const income = await this.incomeService.updateIncome(
      req.user.uid,
      id,
      updateIncomeDto,
    );
    return {
      message: 'Income updated successfully',
      data: income,
    };
  }

  @Delete(':id')
  async deleteIncome(@Request() req, @Param('id') id: string) {
    const response = await this.incomeService.deleteIncome(req.user.uid, id);
    return {
      message: 'Income deleted successfully',
      data: response,
    };
  }
}
