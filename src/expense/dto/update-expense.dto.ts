import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsISO8601()
  @IsOptional()
  date?: Date;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
