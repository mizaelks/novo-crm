
import { WebhookPayload } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Real webhook dispatch function that sends HTTP requests to the specified URL
export const dispatchWebhook = async (payload: WebhookPayload, url: string) => {
  console.log(`Dispatching webhook to ${url}`, payload);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.text();
    console.log(`Webhook response from ${url}:`, responseData);
    return { 
      success: response.ok, 
      url,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error(`Error dispatching webhook to ${url}:`, error);
    return { 
      success: false, 
      url,
      error: error instanceof Error ? error.message : String(error)
    };
  }
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
    return { dispatched: 0, success: 0, failed: 0 };
  }

  const eventName = `${entityType}.${eventType}`;
  const payload: WebhookPayload = {
    event: eventName,
    data,
  };

  const promises = (webhooks ?? []).map(webhook => dispatchWebhook(payload, webhook.url));
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  return { 
    dispatched: promises.length,
    success: successful,
    failed,
    results
  };
};
