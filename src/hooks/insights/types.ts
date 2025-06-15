
export interface ConversionData {
  stageName: string;
  opportunities: number;
  conversionRate: number;
}

export interface ValueData {
  month: string;
  value: number;
}

export interface StatsData {
  totalOpportunities: number;
  totalValue: number;
  totalSales: number;
  totalSalesValue: number;
  averageTicket: number;
  conversionRate: number;
}

export interface EnhancedStatsData extends StatsData {
  previousPeriodStats?: StatsData;
}
