
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
    id: 'call-client',
    name: 'Ligar para cliente',
    description: 'Fazer contato telefônico com o cliente',
    category: 'contact',
    defaultDuration: 24,
    icon: 'phone',
    color: 'blue'
  },
  {
    id: 'whatsapp-message',
    name: 'Enviar WhatsApp',
    description: 'Entrar em contato via WhatsApp',
    category: 'contact',
    defaultDuration: 2,
    icon: 'message-circle',
    color: 'green'
  },
  {
    id: 'send-email',
    name: 'Enviar e-mail',
    description: 'Enviar e-mail para o cliente',
    category: 'contact',
    defaultDuration: 4,
    icon: 'mail',
    color: 'orange'
  },
  {
    id: 'send-proposal',
    name: 'Enviar proposta',
    description: 'Preparar e enviar proposta comercial',
    category: 'document',
    defaultDuration: 48,
    icon: 'file-text',
    color: 'purple'
  },
  {
    id: 'schedule-meeting',
    name: 'Agendar reunião',
    description: 'Marcar reunião com o cliente',
    category: 'meeting',
    defaultDuration: 24,
    icon: 'calendar',
    color: 'indigo'
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    description: 'Fazer acompanhamento do cliente',
    category: 'followup',
    defaultDuration: 72,
    icon: 'clock',
    color: 'yellow'
  },
  {
    id: 'collect-documents',
    name: 'Coletar documentos',
    description: 'Solicitar documentos necessários',
    category: 'document',
    defaultDuration: 48,
    icon: 'folder',
    color: 'gray'
  },
  {
    id: 'contract-signature',
    name: 'Assinatura de contrato',
    description: 'Agendar assinatura do contrato',
    category: 'document',
    defaultDuration: 168,
    icon: 'file-check',
    color: 'emerald'
  }
];

export type SortingOption = 'free' | 'urgency' | 'priority';

export interface StageSortConfig {
  type: SortingOption;
  enabled: boolean;
}
