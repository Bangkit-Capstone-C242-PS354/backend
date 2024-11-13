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
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '../guard/auth.guard';

@Controller('incomes')
@UseGuards(AuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async createIncome(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.createIncome(req.user.uid, createIncomeDto);
  }

  @Get()
  async getUserIncomes(@Request() req) {
    return this.incomeService.getUserIncomes(req.user.uid);
  }

  @Get(':id')
  async getIncome(@Request() req, @Param('id') id: string) {
    return this.incomeService.getIncome(req.user.uid, id);
  }

  @Put(':id')
  async updateIncome(
    @Request() req,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomeService.updateIncome(req.user.uid, id, updateIncomeDto);
  }

  @Delete(':id')
  async deleteIncome(@Request() req, @Param('id') id: string) {
    return this.incomeService.deleteIncome(req.user.uid, id);
  }
}
