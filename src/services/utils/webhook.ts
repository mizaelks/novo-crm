import { WebhookPayload } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Webhook dispatch simulation (could be updated later for real external calls)
export const dispatchWebhook = async (payload: WebhookPayload, url: string) => {
  console.log(`Dispatching webhook to ${url}`, payload);
  return { success: true, url };
};

export const triggerEntityWebhooks = async (
  entityType: 'funnel' | 'stage' | 'opportunity',
  entityId: string,
  eventType: 'create' | 'update' | 'move',
  data: any
) => {
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('target_type', entityType)
    .eq('target_id', entityId)
    .eq('event', eventType);

  if (error) {
    console.error("Failed to fetch webhooks:", error);
    return { dispatched: 0 };
  }

  const eventName = `${entityType}.${eventType}`;
  const payload: WebhookPayload = {
    event: eventName,
    data,
  };

  const promises = (webhooks ?? []).map(webhook => dispatchWebhook(payload, webhook.url));
  await Promise.all(promises);

  return { dispatched: promises.length };
};
