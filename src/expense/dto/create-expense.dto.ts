import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsISO8601,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsISO8601()
  date: Date;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  note?: string;
}
