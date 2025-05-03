
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
  color?: string; // Color for the stage
  isWinStage?: boolean; // Whether this is a "win" stage
  isLossStage?: boolean; // Whether this is a "loss" stage
  requiredFields?: RequiredField[]; // Required fields for opportunities in this stage
}

export interface RequiredField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select';
  options?: string[]; // For select type fields
  isRequired: boolean;
  stageId: string;
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
  phone?: string;
  email?: string;
  company?: string;
  customFields?: Record<string, any>; // For storing custom field values
}

export interface WebhookConfig {
  id: string;
  targetType: 'funnel' | 'stage' | 'opportunity';
  targetId: string;
  url: string;
  event: 'create' | 'update' | 'move';
}

export interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  url: string;
  targetType: 'funnel' | 'stage' | 'opportunity';
  event: 'create' | 'update' | 'move';
  payload: string; // JSON template
  createdAt: Date;
}

export interface ScheduledAction {
  id: string;
  opportunityId: string;
  actionType: 'email' | 'webhook' | 'task';
  actionConfig: {
    // Webhook-specific fields
    url?: string;
    method?: string; // Método HTTP (POST, GET, etc)
    payload?: any;
    // Email-specific fields
    email?: string;
    subject?: string;
    body?: string;
    // Task-specific fields
    title?: string;
    assignedTo?: string;
    // Common fields
    description?: string;
    templateId?: string; // ID of webhook template
    moveToNextStage?: boolean;
    nextStageId?: string;
    response?: {
      status?: number;
      body?: string;
      success?: boolean;
      executed_at?: string;
      error?: string;
    }
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
  color?: string;
  isWinStage?: boolean;
  isLossStage?: boolean;
}

export interface RequiredFieldFormData {
  name: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select';
  options?: string[]; // For select type fields
  isRequired: boolean;
  stageId: string;
}

export interface OpportunityFormData {
  title: string;
  value: number;
  client: string;
  stageId: string;
  funnelId: string;
  phone?: string;
  email?: string;
  company?: string;
  customFields?: Record<string, any>;
}

export interface WebhookFormData {
  targetType: 'funnel' | 'stage' | 'opportunity';
  targetId: string;
  url: string;
  event: 'create' | 'update' | 'move';
}

export interface WebhookTemplateFormData {
  name: string;
  description: string;
  url: string;
  targetType: 'funnel' | 'stage' | 'opportunity';
  event: 'create' | 'update' | 'move';
  payload: string; // JSON template
}

export interface ScheduledActionFormData {
  opportunityId: string;
  actionType: 'email' | 'webhook' | 'task';
  actionConfig: {
    // Webhook-specific fields
    url?: string;
    method?: string;
    payload?: any;
    // Email-specific fields
    email?: string;
    subject?: string;
    body?: string;
    // Task-specific fields
    title?: string;
    assignedTo?: string;
    // Common fields
    description?: string;
    templateId?: string;
    moveToNextStage?: boolean;
    nextStageId?: string;
    response?: {
      status?: number;
      body?: string;
      success?: boolean;
      executed_at?: string;
      error?: string;
    }
  };
  scheduledDateTime: Date;
  templateId?: string; // Adding the missing templateId property
}
