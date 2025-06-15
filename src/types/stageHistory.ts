
export interface StageHistoryEntry {
  id: string;
  opportunityId: string;
  fromStageId: string | null; // null para entrada inicial no funil
  toStageId: string;
  movedAt: Date;
  userId: string | null;
}

export interface PassThroughRateData {
  stageId: string;
  stageName: string;
  entriesCount: number; // oportunidades que entraram na etapa
  exitsCount: number; // oportunidades que saíram da etapa
  passThroughRate: number; // percentage (0-100)
  currentCount: number; // oportunidades atualmente na etapa
}

export interface StageVelocityData {
  stageId: string;
  stageName: string;
  averageDaysInStage: number;
  totalOpportunities: number;
}

export interface FunnelPassThroughData {
  funnelId: string;
  funnelName: string;
  stages: PassThroughRateData[];
  overallConversionRate: number;
  averageVelocity: number; // dias médios do início ao fim
}
