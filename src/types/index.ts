
// Domain models
export interface Funnel {
  id: string;
  name: string;
  description: string;
  order: number;
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  order: number;
  funnelId: string;
  opportunities: Opportunity[];
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  client: string;
  createdAt: Date;
  stageId: string;
  funnelId: string;
  scheduledActions?: ScheduledAction[];
}

export interface WebhookConfig {
  id: string;
  targetType: 'funnel' | 'stage' | 'opportunity';
  targetId: string;
  url: string;
  event: 'create' | 'update' | 'move';
}

export interface ScheduledAction {
  id: string;
  opportunityId: string;
  actionType: 'email' | 'webhook';
  actionConfig: {
    url?: string;
    email?: string;
    subject?: string;
    body?: string;
  };
  scheduledDateTime: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface WebhookPayload {
  event: string;
  data: any;
}

// Form types
export interface FunnelFormData {
  name: string;
  description: string;
}

export interface StageFormData {
  name: string;
  description: string;
  funnelId: string;
}

export interface OpportunityFormData {
  title: string;
  value: number;
  client: string;
  stageId: string;
  funnelId: string;
}

export interface WebhookFormData {
  targetType: 'funnel' | 'stage' | 'opportunity';
  targetId: string;
  url: string;
  event: 'create' | 'update' | 'move';
}

export interface ScheduledActionFormData {
  opportunityId: string;
  actionType: 'email' | 'webhook';
  actionConfig: {
    url?: string;
    email?: string;
    subject?: string;
    body?: string;
  };
  scheduledDateTime: Date;
}
