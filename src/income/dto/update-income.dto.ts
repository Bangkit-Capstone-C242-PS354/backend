import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';

export class UpdateIncomeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsISO8601()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}
