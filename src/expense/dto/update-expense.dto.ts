import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsISO8601()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
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
