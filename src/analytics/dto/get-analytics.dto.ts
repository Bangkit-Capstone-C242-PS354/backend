import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export enum PeriodType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom',
}

export class GetAnalyticsDto {
  @IsEnum(PeriodType)
  periodType: PeriodType;

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;
} 