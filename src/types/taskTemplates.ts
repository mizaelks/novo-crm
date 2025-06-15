
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'followup' | 'contact' | 'document' | 'meeting' | 'other';
  defaultDuration: number; // em horas
  icon: string;
  color: string;
}

export const DEFAULT_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'follow-up-call',
    name: 'Ligar para cliente',
    description: 'Fazer contato telefônico com o cliente',
    category: 'contact',
    defaultDuration: 24,
    icon: 'phone',
    color: 'blue'
  },
  {
    id: 'send-proposal',
    name: 'Enviar proposta',
    description: 'Preparar e enviar proposta comercial',
    category: 'document',
    defaultDuration: 48,
    icon: 'file-text',
    color: 'green'
  },
  {
    id: 'schedule-meeting',
    name: 'Agendar reunião',
    description: 'Marcar reunião com o cliente',
    category: 'meeting',
    defaultDuration: 24,
    icon: 'calendar',
    color: 'purple'
  },
  {
    id: 'follow-up-email',
    name: 'E-mail de follow-up',
    description: 'Enviar e-mail de acompanhamento',
    category: 'followup',
    defaultDuration: 12,
    icon: 'mail',
    color: 'orange'
  },
  {
    id: 'collect-documents',
    name: 'Coletar documentos',
    description: 'Solicitar documentos necessários',
    category: 'document',
    defaultDuration: 72,
    icon: 'folder',
    color: 'yellow'
  }
];

export type SortingOption = 'free' | 'urgency' | 'priority';

export interface StageSortConfig {
  type: SortingOption;
  enabled: boolean;
}
