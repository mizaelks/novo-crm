
import { opportunityAPI } from './opportunityAPI';
import { funnelAPI } from './funnelAPI';
import { stageAPI } from './stageAPI';
import { webhookAPI } from './webhookAPI';
import { webhookTemplateAPI } from './webhookTemplateAPI';
import { scheduledActionAPI } from './scheduledActionAPI';

export const useOpportunityAPI = () => {
  return { opportunityAPI };
};

export const useFunnelAPI = () => {
  return { funnelAPI };
};

export const useStageAPI = () => {
  return { stageAPI };
};

export const useWebhookAPI = () => {
  return { webhookAPI };
};

export const useWebhookTemplateAPI = () => {
  return { webhookTemplateAPI };
};

export const useScheduledActionAPI = () => {
  return { scheduledActionAPI };
};

export {
  opportunityAPI,
  funnelAPI,
  stageAPI,
  webhookAPI,
  webhookTemplateAPI,
  scheduledActionAPI
};
