
import { Funnel, Opportunity, Stage, WebhookConfig, ScheduledAction } from '../types';

// Mock data for our CRM Kanban
export const mockFunnels: Funnel[] = [
  {
    id: '1',
    name: 'Vendas B2B',
    description: 'Funil de vendas para clientes corporativos',
    order: 1,
    stages: [],
  },
  {
    id: '2',
    name: 'Marketing Lead',
    description: 'Funil de qualificação de leads de marketing',
    order: 2,
    stages: [],
  },
];

export const mockStages: Stage[] = [
  {
    id: '1',
    name: 'Prospecção',
    description: 'Clientes em fase inicial de contato',
    order: 1,
    funnelId: '1',
    opportunities: [],
  },
  {
    id: '2',
    name: 'Qualificação',
    description: 'Avaliação de fit com nosso produto',
    order: 2,
    funnelId: '1',
    opportunities: [],
  },
  {
    id: '3',
    name: 'Proposta',
    description: 'Proposta comercial enviada',
    order: 3,
    funnelId: '1',
    opportunities: [],
  },
  {
    id: '4',
    name: 'Fechamento',
    description: 'Negociação final e fechamento',
    order: 4,
    funnelId: '1',
    opportunities: [],
  },
  {
    id: '5',
    name: 'Lead',
    description: 'Leads capturados do site',
    order: 1,
    funnelId: '2',
    opportunities: [],
  },
  {
    id: '6',
    name: 'MQL',
    description: 'Marketing Qualified Lead',
    order: 2,
    funnelId: '2',
    opportunities: [],
  },
  {
    id: '7',
    name: 'SQL',
    description: 'Sales Qualified Lead',
    order: 3,
    funnelId: '2',
    opportunities: [],
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Empresa ABC',
    value: 15000,
    client: 'João Silva',
    createdAt: new Date('2023-01-15'),
    stageId: '1',
    funnelId: '1',
  },
  {
    id: '2',
    title: 'Corporação XYZ',
    value: 28000,
    client: 'Maria Oliveira',
    createdAt: new Date('2023-02-10'),
    stageId: '2',
    funnelId: '1',
  },
  {
    id: '3',
    title: 'Tech Solutions Inc',
    value: 45000,
    client: 'Pedro Santos',
    createdAt: new Date('2023-03-05'),
    stageId: '3',
    funnelId: '1',
  },
  {
    id: '4',
    title: 'Global Services',
    value: 60000,
    client: 'Ana Costa',
    createdAt: new Date('2023-04-20'),
    stageId: '4',
    funnelId: '1',
  },
  {
    id: '5',
    title: 'Lead Site Form',
    value: 5000,
    client: 'Carlos Mendes',
    createdAt: new Date('2023-05-12'),
    stageId: '5',
    funnelId: '2',
  },
  {
    id: '6',
    title: 'Lead Webinar',
    value: 7500,
    client: 'Fernanda Lima',
    createdAt: new Date('2023-06-08'),
    stageId: '6',
    funnelId: '2',
  },
  {
    id: '7',
    title: 'Lead Campanha',
    value: 12000,
    client: 'Roberto Alves',
    createdAt: new Date('2023-07-15'),
    stageId: '7',
    funnelId: '2',
  },
];

export const mockWebhooks: WebhookConfig[] = [
  {
    id: '1',
    targetType: 'funnel',
    targetId: '1',
    url: 'https://example.com/webhook/funnel1',
    event: 'update',
  },
  {
    id: '2',
    targetType: 'stage',
    targetId: '3',
    url: 'https://example.com/webhook/stage3',
    event: 'create',
  },
  {
    id: '3',
    targetType: 'opportunity',
    targetId: '2',
    url: 'https://example.com/webhook/opportunity2',
    event: 'move',
  },
];

export const mockScheduledActions: ScheduledAction[] = [
  {
    id: '1',
    opportunityId: '1',
    actionType: 'email',
    actionConfig: {
      email: 'cliente@example.com',
      subject: 'Seguimento da proposta',
      body: 'Olá, gostaria de saber se você teve tempo de analisar nossa proposta...',
    },
    scheduledDateTime: new Date('2023-08-25T10:00:00'),
    status: 'pending',
  },
  {
    id: '2',
    opportunityId: '3',
    actionType: 'webhook',
    actionConfig: {
      url: 'https://example.com/api/notification',
    },
    scheduledDateTime: new Date('2023-08-26T15:30:00'),
    status: 'pending',
  },
];

// Initialize stages with opportunities
mockStages.forEach(stage => {
  stage.opportunities = mockOpportunities.filter(opp => opp.stageId === stage.id);
});

// Initialize funnels with stages
mockFunnels.forEach(funnel => {
  funnel.stages = mockStages.filter(stage => stage.funnelId === funnel.id);
});

// Get all opportunities with their scheduled actions
export function getAllOpportunitiesWithActions() {
  return mockOpportunities.map(opp => ({
    ...opp,
    scheduledActions: mockScheduledActions.filter(action => action.opportunityId === opp.id)
  }));
}
