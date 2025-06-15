
export interface ValueData {
  month: string;
  value: number;
}

export interface StatsData {
  totalOpportunities: number;
  totalValue: number;
  totalSales: number;
  totalSalesValue: number;
  totalRelationships: number;
  averageTicket: number;
  conversionRate: number;
  relationshipConversionRate: number;
}

export interface EnhancedStatsData extends StatsData {
  previousPeriodStats?: StatsData;
}
