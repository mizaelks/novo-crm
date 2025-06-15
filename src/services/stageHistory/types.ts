
export interface StageHistoryAPIInterface {
  recordStageMove: (opportunityId: string, fromStageId: string | null, toStageId: string, userId?: string) => Promise<any>;
  getOpportunityHistory: (opportunityId: string) => Promise<any[]>;
  getStagePassThroughRate: (stageId: string, dateFrom?: Date, dateTo?: Date) => Promise<any>;
  getFunnelPassThroughRates: (funnelId: string, dateFrom?: Date, dateTo?: Date) => Promise<any>;
  getFunnelAverageVelocity: (funnelId: string, dateFrom?: Date, dateTo?: Date) => Promise<number>;
  getStageVelocity: (stageId: string, dateFrom?: Date, dateTo?: Date) => Promise<any>;
}
