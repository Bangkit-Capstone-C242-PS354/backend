import { IsString, IsNumber, IsISO8601 } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  title: string;

  @IsISO8601()
  date: string;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;
}
