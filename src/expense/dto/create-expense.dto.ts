import {
  IsString,
  IsNumber,
  IsOptional,
  IsISO8601,
  IsUrl,
} from 'class-validator';
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

  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  tax?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
