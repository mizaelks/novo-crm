
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
  console.log(`Triggering ${eventType} webhooks for ${entityType} ${entityId}`, data);

  try {
    // Buscar webhooks específicos para esta entidade e também os webhooks genéricos (target_id = '*')
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('target_type', entityType)
      .eq('event', eventType)
      .or(`target_id.eq.${entityId},target_id.eq.*`);

    if (error) {
      console.error("Failed to fetch webhooks:", error);
      return { dispatched: 0, success: 0, failed: 0 };
    }

    console.log(`Found ${webhooks?.length || 0} webhooks to dispatch`);

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
  } catch (e) {
    console.error("Error in triggerEntityWebhooks:", e);
    return { dispatched: 0, success: 0, failed: 0 };
  }
};
