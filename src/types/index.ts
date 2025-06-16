// Domain models
export interface Funnel {
  id: string;
  name: string;
  description: string;
  order: number;
  funnelType: 'venda' | 'relacionamento';
  stages: Stage[];
  is_shared?: boolean; // Add shared funnel support
}

export interface StageSortConfig {
  type: 'free' | 'urgency' | 'priority';
  enabled: boolean;
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
  requiredTasks?: RequiredTask[]; // Required tasks for opportunities in this stage
  alertConfig?: StageAlertConfig; // Alert configuration for this stage
  migrateConfig?: StageMigrateConfig; // Migration configuration for this stage
  sortConfig?: StageSortConfig; // Sorting configuration for this stage
  winReasonRequired?: boolean; // Whether win reason is required
  lossReasonRequired?: boolean; // Whether loss reason is required
  winReasons?: string[]; // Available win reasons
  lossReasons?: string[]; // Available loss reasons
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
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select';
  options?: string[]; // For select type fields
  isRequired: boolean;
  stageId: string;
}

export interface RequiredTask {
  id: string;
  name: string;
  description?: string;
  defaultDuration: number; // em horas
  templateId?: string; // ID do template de tarefa (como 'ligar', 'whatsapp', etc.)
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
  requiredTasksCompleted?: string[]; // Array of required task IDs that have been completed
  userId?: string; // ID of the user who created this opportunity
  winReason?: string; // Reason for winning
  lossReason?: string; // Reason for losing
  archived?: boolean; // Add archived property
  archivedAt?: Date; // Add archived timestamp
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
  funnelType: 'venda' | 'relacionamento';
}

export interface StageFormData {
  name: string;
  description: string;
  funnelId: string;
  color?: string;
  isWinStage?: boolean;
  isLossStage?: boolean;
  requiredFields?: RequiredField[];
  requiredTasks?: RequiredTask[];
  order?: number; // Add order property to fix the TypeScript errors
  alertConfig?: StageAlertConfig;
  migrateConfig?: StageMigrateConfig;
  sortConfig?: StageSortConfig;
  winReasonRequired?: boolean;
  lossReasonRequired?: boolean;
  winReasons?: string[];
  lossReasons?: string[];
}

export interface RequiredFieldFormData {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select';
  options?: string[]; // For select type fields
  isRequired: boolean;
  stageId: string;
}

export interface RequiredTaskFormData {
  name: string;
  description?: string;
  defaultDuration: number;
  templateId?: string;
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
  userId?: string;
  winReason?: string;
  lossReason?: string;
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
