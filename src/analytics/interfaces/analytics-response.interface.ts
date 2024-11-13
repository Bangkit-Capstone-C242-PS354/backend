export interface CategoryAnalytics {
  category: string;
  percentage: number;
  total: number;
}

export interface AnalyticsResponse {
  data: CategoryAnalytics[];
  periodTotal: number;
} 