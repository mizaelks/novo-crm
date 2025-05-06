
import { webhookAPI } from "@/services/webhookAPI";
import { WebhookConfig } from "@/types";

/**
 * Dispatches a webhook to the specified URL
 * @param payload The data payload to send
 * @param url The URL to send the webhook to
 * @returns Object containing success status and response information
 */
export const dispatchWebhook = async (
  payload: any,
  url: string
): Promise<{ success: boolean; status?: number; error?: string }> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Test': 'true',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log(`Test webhook to ${url} succeeded with status ${response.status}`);
      return { success: true, status: response.status };
    } else {
      console.error(`Test webhook to ${url} failed with status ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error(`Test webhook to ${url} failed with error:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Triggers all webhooks associated with a specific entity
 * @param entityType The type of entity (funnel, stage, opportunity)
 * @param entityId The ID of the entity
 * @param eventType The event type (create, update, move)
 * @param payload The data payload to send
 */
export const triggerEntityWebhooks = async (
  entityType: 'funnel' | 'stage' | 'opportunity',
  entityId: string,
  eventType: 'create' | 'update' | 'move',
  payload: any
) => {
  try {
    console.log(`Triggering ${eventType} webhooks for ${entityType} ${entityId}`, payload);
    
    // Get all webhooks for this entity type, entity ID, and event type
    // Note: This needs to be modified in the webhookAPI to handle wildcards properly
    const webhooks = await webhookAPI.getByTarget(entityType, entityId);

    // Filter webhooks by event type
    const matchingWebhooks = webhooks.filter(webhook => webhook.event === eventType);
    
    let successCount = 0;
    let failCount = 0;
    
    // Execute all matching webhooks
    const promises = matchingWebhooks.map(async webhook => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': `${entityType}.${eventType}`,
            'X-Webhook-ID': webhook.id,
          },
          body: JSON.stringify({
            event: `${entityType}.${eventType}`,
            data: payload
          }),
        });
        
        if (response.ok) {
          successCount++;
          return { success: true, webhook };
        } else {
          failCount++;
          console.error(`Webhook to ${webhook.url} failed with status ${response.status}`);
          return { success: false, webhook, error: `Status code ${response.status}` };
        }
      } catch (error) {
        failCount++;
        console.error(`Webhook to ${webhook.url} failed with error:`, error);
        return { success: false, webhook, error };
      }
    });
    
    await Promise.allSettled(promises);
    
    return {
      dispatched: matchingWebhooks.length,
      success: successCount,
      failed: failCount
    };
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return {
      dispatched: 0,
      success: 0,
      failed: 0
    };
  }
};
