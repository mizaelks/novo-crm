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
  alertConfig?: StageAlertConfig; // Alert configuration for this stage
  migrateConfig?: StageMigrateConfig; // Migration configuration for this stage
  sortConfig?: StageSortConfig; // Sorting configuration for this stage
}

export interface StageAlertConfig {
  enabled: boolean;
  maxDaysInStage: number;
  alertMessage?: string;
}

export interface StageMigrateConfig {
  enabled: boolean;
  targetFunnelId: string;
  targetStageId: string;
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
  lastStageChangeAt?: Date; // Track when opportunity was moved to current stage
  sourceOpportunityId?: string; // ID of the original opportunity when this was created by migration
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
    templateId?: string; // ID do template de tarefa padrão
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
  status: 'pending' | 'completed' | 'failed';
}

export interface WebhookPayload {
  event: string;
  data: any;
}

// Notification system types for future implementation
export interface Notification {
  id: string;
  userId?: string;
  type: 'opportunity_alert' | 'stage_deadline' | 'system' | 'webhook_failed';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationConfig {
  id: string;
  userId?: string;
  type: 'opportunity_alert' | 'stage_deadline';
  enabled: boolean;
  channels: ('in_app' | 'email' | 'webhook')[];
  settings: Record<string, any>;
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
  requiredFields?: RequiredField[];
  order?: number; // Add order property to fix the TypeScript errors
  alertConfig?: StageAlertConfig;
  migrateConfig?: StageMigrateConfig;
  sortConfig?: StageSortConfig;
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
  actionType: 'webhook' | 'task';
  actionConfig: any;
  scheduledDateTime: Date | string;
  templateId?: string | null;
}

// Export SortingOption that was missing
export type { SortingOption } from './taskTemplates';
