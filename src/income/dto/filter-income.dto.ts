import { IsISO8601, IsEnum, IsOptional } from 'class-validator';
import { Period } from 'src/analytics/interfaces/period.enum';

export class FilterIncomeDto {
  @IsEnum(Period)
  @IsOptional()
  period?: Period;

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;
} 