import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsISO8601()
  date: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  note?: string;
}
