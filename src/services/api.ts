
import { 
  Funnel, 
  Stage, 
  Opportunity, 
  WebhookConfig, 
  ScheduledAction, 
  FunnelFormData,
  StageFormData,
  OpportunityFormData,
  WebhookFormData,
  ScheduledActionFormData,
  WebhookPayload
} from '../types';

import { 
  mockFunnels, 
  mockStages, 
  mockOpportunities, 
  mockWebhooks, 
  mockScheduledActions 
} from './mockData';

// Utility function to generate IDs (would be handled by DB in real impl)
const generateId = () => Math.random().toString(36).substring(2, 9);

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Webhook dispatch simulation
const dispatchWebhook = async (payload: WebhookPayload, url: string) => {
  console.log(`Dispatching webhook to ${url}`, payload);
  // In a real implementation, this would make an actual HTTP request
  await delay(300);
  return { success: true, url };
};

// Trigger webhooks for an entity
const triggerEntityWebhooks = async (entityType: 'funnel' | 'stage' | 'opportunity', entityId: string, eventType: 'create' | 'update' | 'move', data: any) => {
  // Find relevant webhook configs
  const webhooks = mockWebhooks.filter(
    hook => hook.targetType === entityType && 
            hook.targetId === entityId && 
            hook.event === eventType
  );
  
  // Build payload
  const eventName = `${entityType}.${eventType}`;
  const payload: WebhookPayload = {
    event: eventName,
    data: data
  };
  
  // Dispatch to all matching webhooks
  const promises = webhooks.map(webhook => dispatchWebhook(payload, webhook.url));
  await Promise.all(promises);
  
  return { dispatched: promises.length };
};

// Funnel API
export const funnelAPI = {
  getAll: async (): Promise<Funnel[]> => {
    await delay(300);
    return [...mockFunnels];
  },
  
  getById: async (id: string): Promise<Funnel | null> => {
    await delay(200);
    const funnel = mockFunnels.find(f => f.id === id);
    return funnel ? {...funnel} : null;
  },
  
  create: async (data: FunnelFormData): Promise<Funnel> => {
    await delay(400);
    const newFunnel: Funnel = {
      id: generateId(),
      name: data.name,
      description: data.description,
      order: mockFunnels.length + 1,
      stages: []
    };
    
    mockFunnels.push(newFunnel);
    
    // Trigger webhooks
    await triggerEntityWebhooks('funnel', newFunnel.id, 'create', newFunnel);
    
    return newFunnel;
  },
  
  update: async (id: string, data: Partial<FunnelFormData>): Promise<Funnel | null> => {
    await delay(400);
    const funnelIndex = mockFunnels.findIndex(f => f.id === id);
    
    if (funnelIndex === -1) return null;
    
    mockFunnels[funnelIndex] = {
      ...mockFunnels[funnelIndex],
      ...data
    };
    
    // Trigger webhooks
    await triggerEntityWebhooks('funnel', id, 'update', mockFunnels[funnelIndex]);
    
    return {...mockFunnels[funnelIndex]};
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = mockFunnels.length;
    const funnelIndex = mockFunnels.findIndex(f => f.id === id);
    
    if (funnelIndex === -1) return false;
    
    // Remove the funnel
    mockFunnels.splice(funnelIndex, 1);
    
    return mockFunnels.length < initialLength;
  }
};

// Stage API
export const stageAPI = {
  getAll: async (): Promise<Stage[]> => {
    await delay(300);
    return [...mockStages];
  },
  
  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    await delay(200);
    const stages = mockStages.filter(s => s.funnelId === funnelId);
    return [...stages];
  },
  
  getById: async (id: string): Promise<Stage | null> => {
    await delay(200);
    const stage = mockStages.find(s => s.id === id);
    return stage ? {...stage} : null;
  },
  
  create: async (data: StageFormData): Promise<Stage> => {
    await delay(400);
    // Get the current stages in this funnel to determine order
    const funnelStages = mockStages.filter(s => s.funnelId === data.funnelId);
    
    const newStage: Stage = {
      id: generateId(),
      name: data.name,
      description: data.description,
      order: funnelStages.length + 1,
      funnelId: data.funnelId,
      opportunities: []
    };
    
    mockStages.push(newStage);
    
    // Update the funnel's stages
    const funnel = mockFunnels.find(f => f.id === data.funnelId);
    if (funnel) {
      funnel.stages.push(newStage);
    }
    
    // Trigger webhooks
    await triggerEntityWebhooks('stage', newStage.id, 'create', newStage);
    
    return newStage;
  },
  
  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    await delay(400);
    const stageIndex = mockStages.findIndex(s => s.id === id);
    
    if (stageIndex === -1) return null;
    
    mockStages[stageIndex] = {
      ...mockStages[stageIndex],
      ...data
    };
    
    // Trigger webhooks
    await triggerEntityWebhooks('stage', id, 'update', mockStages[stageIndex]);
    
    return {...mockStages[stageIndex]};
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = mockStages.length;
    const stageIndex = mockStages.findIndex(s => s.id === id);
    
    if (stageIndex === -1) return false;
    
    // Get funnel to update its stages
    const funnelId = mockStages[stageIndex].funnelId;
    const funnel = mockFunnels.find(f => f.id === funnelId);
    
    // Remove the stage from funnel stages
    if (funnel) {
      const funnelStageIndex = funnel.stages.findIndex(s => s.id === id);
      if (funnelStageIndex !== -1) {
        funnel.stages.splice(funnelStageIndex, 1);
      }
    }
    
    // Remove the stage
    mockStages.splice(stageIndex, 1);
    
    return mockStages.length < initialLength;
  }
};

// Opportunity API
export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    await delay(300);
    return [...mockOpportunities];
  },
  
  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    await delay(200);
    const opportunities = mockOpportunities.filter(o => o.stageId === stageId);
    return [...opportunities];
  },
  
  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    await delay(200);
    const opportunities = mockOpportunities.filter(o => o.funnelId === funnelId);
    return [...opportunities];
  },
  
  getById: async (id: string): Promise<Opportunity | null> => {
    await delay(200);
    const opportunity = mockOpportunities.find(o => o.id === id);
    return opportunity ? {...opportunity} : null;
  },
  
  create: async (data: OpportunityFormData): Promise<Opportunity> => {
    await delay(400);
    const newOpportunity: Opportunity = {
      id: generateId(),
      title: data.title,
      value: data.value,
      client: data.client,
      createdAt: new Date(),
      stageId: data.stageId,
      funnelId: data.funnelId,
    };
    
    mockOpportunities.push(newOpportunity);
    
    // Update the stage's opportunities
    const stage = mockStages.find(s => s.id === data.stageId);
    if (stage) {
      stage.opportunities.push(newOpportunity);
    }
    
    // Trigger webhooks
    await triggerEntityWebhooks('opportunity', newOpportunity.id, 'create', newOpportunity);
    
    return newOpportunity;
  },
  
  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    await delay(400);
    const oppIndex = mockOpportunities.findIndex(o => o.id === id);
    
    if (oppIndex === -1) return null;
    
    const originalStageId = mockOpportunities[oppIndex].stageId;
    const newStageId = data.stageId || originalStageId;
    
    // Handle stage change 
    if (data.stageId && data.stageId !== originalStageId) {
      // Remove from old stage
      const oldStage = mockStages.find(s => s.id === originalStageId);
      if (oldStage) {
        oldStage.opportunities = oldStage.opportunities.filter(o => o.id !== id);
      }
      
      // Add to new stage
      const newStage = mockStages.find(s => s.id === data.stageId);
      if (newStage) {
        // Make a copy of the opportunity with the updated stageId
        const updatedOpp = {
          ...mockOpportunities[oppIndex],
          stageId: data.stageId
        };
        newStage.opportunities.push(updatedOpp);
      }
    }
    
    // Update the opportunity
    mockOpportunities[oppIndex] = {
      ...mockOpportunities[oppIndex],
      ...data
    };
    
    // Trigger appropriate webhooks
    if (newStageId !== originalStageId) {
      await triggerEntityWebhooks('opportunity', id, 'move', mockOpportunities[oppIndex]);
    } else {
      await triggerEntityWebhooks('opportunity', id, 'update', mockOpportunities[oppIndex]);
    }
    
    return {...mockOpportunities[oppIndex]};
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = mockOpportunities.length;
    const oppIndex = mockOpportunities.findIndex(o => o.id === id);
    
    if (oppIndex === -1) return false;
    
    // Get stage to update its opportunities
    const stageId = mockOpportunities[oppIndex].stageId;
    const stage = mockStages.find(s => s.id === stageId);
    
    // Remove from stage's opportunities
    if (stage) {
      stage.opportunities = stage.opportunities.filter(o => o.id !== id);
    }
    
    // Remove the opportunity
    mockOpportunities.splice(oppIndex, 1);
    
    return mockOpportunities.length < initialLength;
  },
  
  // Move opportunity between stages
  move: async (id: string, newStageId: string): Promise<Opportunity | null> => {
    await delay(300);
    const opportunity = mockOpportunities.find(o => o.id === id);
    
    if (!opportunity) return null;
    
    const oldStageId = opportunity.stageId;
    
    // Update the opportunity with the new stageId
    opportunity.stageId = newStageId;
    
    // Remove from old stage
    const oldStage = mockStages.find(s => s.id === oldStageId);
    if (oldStage) {
      oldStage.opportunities = oldStage.opportunities.filter(o => o.id !== id);
    }
    
    // Add to new stage
    const newStage = mockStages.find(s => s.id === newStageId);
    if (newStage) {
      newStage.opportunities.push(opportunity);
    }
    
    // Trigger webhook for move event
    await triggerEntityWebhooks('opportunity', id, 'move', opportunity);
    
    return {...opportunity};
  }
};

// Webhook API
export const webhookAPI = {
  getAll: async (): Promise<WebhookConfig[]> => {
    await delay(300);
    return [...mockWebhooks];
  },
  
  getById: async (id: string): Promise<WebhookConfig | null> => {
    await delay(200);
    const webhook = mockWebhooks.find(w => w.id === id);
    return webhook ? {...webhook} : null;
  },
  
  getByTarget: async (targetType: 'funnel' | 'stage' | 'opportunity', targetId: string): Promise<WebhookConfig[]> => {
    await delay(200);
    const webhooks = mockWebhooks.filter(w => w.targetType === targetType && w.targetId === targetId);
    return [...webhooks];
  },
  
  create: async (data: WebhookFormData): Promise<WebhookConfig> => {
    await delay(400);
    const newWebhook: WebhookConfig = {
      id: generateId(),
      targetType: data.targetType,
      targetId: data.targetId,
      url: data.url,
      event: data.event,
    };
    
    mockWebhooks.push(newWebhook);
    
    return newWebhook;
  },
  
  update: async (id: string, data: Partial<WebhookFormData>): Promise<WebhookConfig | null> => {
    await delay(400);
    const webhookIndex = mockWebhooks.findIndex(w => w.id === id);
    
    if (webhookIndex === -1) return null;
    
    mockWebhooks[webhookIndex] = {
      ...mockWebhooks[webhookIndex],
      ...data
    };
    
    return {...mockWebhooks[webhookIndex]};
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = mockWebhooks.length;
    const webhookIndex = mockWebhooks.findIndex(w => w.id === id);
    
    if (webhookIndex === -1) return false;
    
    // Remove the webhook
    mockWebhooks.splice(webhookIndex, 1);
    
    return mockWebhooks.length < initialLength;
  },
  
  // Inbound webhook handler simulation
  receiveInbound: async (payload: any): Promise<Opportunity | null> => {
    await delay(500);
    
    // Validate payload for opportunity creation
    if (!payload.title || !payload.stageId || !payload.funnelId) {
      console.error('Invalid webhook payload', payload);
      return null;
    }
    
    // Create or update opportunity based on payload
    const existingOpp = payload.id ? 
      mockOpportunities.find(o => o.id === payload.id) : null;
    
    if (existingOpp) {
      // Update existing
      return opportunityAPI.update(existingOpp.id, payload) as Promise<Opportunity>;
    } else {
      // Create new opportunity
      const newOpportunity: OpportunityFormData = {
        title: payload.title,
        value: payload.value || 0,
        client: payload.client || 'Unknown',
        stageId: payload.stageId,
        funnelId: payload.funnelId
      };
      
      return opportunityAPI.create(newOpportunity);
    }
  }
};

// Scheduled Actions API
export const scheduledActionAPI = {
  getAll: async (): Promise<ScheduledAction[]> => {
    await delay(300);
    return [...mockScheduledActions];
  },
  
  getByOpportunityId: async (opportunityId: string): Promise<ScheduledAction[]> => {
    await delay(200);
    const actions = mockScheduledActions.filter(a => a.opportunityId === opportunityId);
    return [...actions];
  },
  
  getById: async (id: string): Promise<ScheduledAction | null> => {
    await delay(200);
    const action = mockScheduledActions.find(a => a.id === id);
    return action ? {...action} : null;
  },
  
  create: async (data: ScheduledActionFormData): Promise<ScheduledAction> => {
    await delay(400);
    const newAction: ScheduledAction = {
      id: generateId(),
      opportunityId: data.opportunityId,
      actionType: data.actionType,
      actionConfig: {...data.actionConfig},
      scheduledDateTime: data.scheduledDateTime,
      status: 'pending'
    };
    
    mockScheduledActions.push(newAction);
    
    // Set a timeout to "execute" the scheduled action
    const now = new Date();
    const timeUntilExecution = data.scheduledDateTime.getTime() - now.getTime();
    
    if (timeUntilExecution > 0) {
      setTimeout(() => {
        console.log('Executing scheduled action:', newAction);
        
        // Mark as completed
        const actionIndex = mockScheduledActions.findIndex(a => a.id === newAction.id);
        if (actionIndex !== -1) {
          mockScheduledActions[actionIndex].status = 'completed';
        }
        
        // Perform the action (simulated)
        if (newAction.actionType === 'webhook' && newAction.actionConfig.url) {
          dispatchWebhook({
            event: 'scheduledAction.executed',
            data: {
              actionId: newAction.id,
              opportunityId: newAction.opportunityId
            }
          }, newAction.actionConfig.url);
        } else if (newAction.actionType === 'email') {
          console.log('Sending email to:', newAction.actionConfig.email);
          console.log('Subject:', newAction.actionConfig.subject);
          console.log('Body:', newAction.actionConfig.body);
        }
      }, Math.min(timeUntilExecution, 60000)); // Cap at 1 minute for demo purposes
    }
    
    return newAction;
  },
  
  update: async (id: string, data: Partial<ScheduledActionFormData>): Promise<ScheduledAction | null> => {
    await delay(400);
    const actionIndex = mockScheduledActions.findIndex(a => a.id === id);
    
    if (actionIndex === -1) return null;
    
    mockScheduledActions[actionIndex] = {
      ...mockScheduledActions[actionIndex],
      ...data,
      actionConfig: {
        ...mockScheduledActions[actionIndex].actionConfig,
        ...data.actionConfig
      }
    };
    
    return {...mockScheduledActions[actionIndex]};
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = mockScheduledActions.length;
    const actionIndex = mockScheduledActions.findIndex(a => a.id === id);
    
    if (actionIndex === -1) return false;
    
    // Remove the action
    mockScheduledActions.splice(actionIndex, 1);
    
    return mockScheduledActions.length < initialLength;
  },
  
  // Manually execute a scheduled action
  execute: async (id: string): Promise<boolean> => {
    await delay(600);
    const action = mockScheduledActions.find(a => a.id === id);
    
    if (!action) return false;
    
    // Mark as completed
    action.status = 'completed';
    
    // Perform the action (simulated)
    if (action.actionType === 'webhook' && action.actionConfig.url) {
      await dispatchWebhook({
        event: 'scheduledAction.executed',
        data: {
          actionId: action.id,
          opportunityId: action.opportunityId
        }
      }, action.actionConfig.url);
    } else if (action.actionType === 'email') {
      console.log('Sending email to:', action.actionConfig.email);
      console.log('Subject:', action.actionConfig.subject);
      console.log('Body:', action.actionConfig.body);
    }
    
    return true;
  }
};
