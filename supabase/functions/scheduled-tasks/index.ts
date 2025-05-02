
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { format } from 'https://esm.sh/date-fns@3.3.1/format';
import { toZonedTime } from 'https://esm.sh/date-fns-tz@3.0.0/toZonedTime';
import { isPast } from 'https://esm.sh/date-fns@3.3.1/isPast';
import { addSeconds } from 'https://esm.sh/date-fns@3.3.1/addSeconds';

// Types definition for better code organization
interface ScheduledAction {
  id: string;
  opportunity_id: string;
  action_type: string;
  action_config: any;
  scheduled_datetime: string;
  status: string;
  template_id?: string;
}

interface WebhookResponse {
  success: boolean;
  status?: number;
  url: string;
  error?: string;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to process webhook actions
async function processWebhookAction(action: ScheduledAction): Promise<WebhookResponse> {
  try {
    const { url, payload = {}, method = 'POST' } = action.action_config;
    
    if (!url) {
      throw new Error("No URL specified for webhook action");
    }
    
    console.log(`Processing webhook: ${url}, method: ${method}`);
    
    // Enhance payload with opportunity data if needed
    const enhancedPayload = await enhancePayloadWithOpportunityData(payload, action.opportunity_id);
    
    // Process webhook template if specified
    if (action.template_id) {
      return await processWithTemplate(action, enhancedPayload);
    }
    
    // Execute the webhook request
    return await executeWebhookRequest(url, method, enhancedPayload);
  } catch (error) {
    console.error(`Error in webhook processing: ${error instanceof Error ? error.message : String(error)}`);
    return { 
      success: false, 
      url: action.action_config.url || 'unknown',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to enhance payload with opportunity data
async function enhancePayloadWithOpportunityData(payload: any, opportunityId?: string): Promise<any> {
  if (!opportunityId) {
    return payload;
  }
  
  const { data: opportunity, error } = await supabaseClient
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();
    
  if (error || !opportunity) {
    console.log(`No opportunity found for ID: ${opportunityId}`);
    return payload;
  }
  
  console.log(`Added opportunity data to payload for ID: ${opportunityId}`);
  return {
    ...payload,
    opportunity
  };
}

// Helper function to process webhooks with templates
async function processWithTemplate(action: ScheduledAction, basePayload: any): Promise<WebhookResponse> {
  console.log(`Using template ID: ${action.template_id}`);
  
  const { data: template, error } = await supabaseClient
    .from('webhook_templates')
    .select('*')
    .eq('id', action.template_id)
    .single();
    
  if (error || !template) {
    throw new Error(`Template not found: ${error?.message || 'Unknown error'}`);
  }
  
  console.log(`Template found: ${template.name}`);
  
  try {
    // Parse template payload and merge with base payload
    const templatePayload = JSON.parse(template.payload);
    const mergedPayload = { ...templatePayload, ...basePayload };
    
    // Execute the webhook with template URL and merged payload
    return await executeWebhookRequest(template.url, action.action_config.method || 'POST', mergedPayload);
  } catch (parseError) {
    throw new Error(`Template payload parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
  }
}

// Helper function to execute webhook requests
async function executeWebhookRequest(url: string, method: string, payload: any): Promise<WebhookResponse> {
  try {
    // Verify URL is valid
    new URL(url);
    
    console.log(`Dispatching webhook to ${url} with method ${method}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    
    const webhookResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase Scheduled Action'
      },
      body: JSON.stringify(payload)
    });
    
    const responseStatus = webhookResponse.status;
    const responseText = await webhookResponse.text();
    const success = webhookResponse.ok;
    
    console.log(`Webhook response: ${responseStatus}, success: ${success}`);
    console.log(`Response body: ${responseText}`);
    
    return { 
      success, 
      status: responseStatus, 
      url,
      error: success ? undefined : `Failed with status ${responseStatus}`
    };
  } catch (fetchError) {
    console.error(`Error sending webhook: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    return { 
      success: false, 
      url,
      error: fetchError instanceof Error ? fetchError.message : String(fetchError)
    };
  }
}

// Helper function to update action status after processing
async function updateActionStatus(
  actionId: string, 
  status: 'completed' | 'failed', 
  originalConfig: any, 
  response: WebhookResponse
): Promise<void> {
  try {
    await supabaseClient
      .from('scheduled_actions')
      .update({ 
        status,
        action_config: {
          ...originalConfig,
          response: {
            status: response.status,
            success: response.success,
            executed_at: new Date().toISOString(),
            error: response.error
          }
        }
      })
      .eq('id', actionId);
  } catch (updateError) {
    console.error(`Error updating action status: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const timezoneBrasilia = 'America/Sao_Paulo';
    console.log("Scheduled tasks function handling request");
    
    // Get current time
    const now = new Date();
    console.log(`Current UTC time: ${now.toISOString()}`);
    
    // Convert to Brazil timezone (GMT-3)
    const brasiliaTime = toZonedTime(now, timezoneBrasilia);
    console.log(`Brasilia time: ${format(brasiliaTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: timezoneBrasilia })}`);
    
    // Include actions scheduled up to 2 minutes ago to catch any that might have been missed
    const twoMinutesAgo = addSeconds(now, -120).toISOString();
    console.log(`Fetching actions scheduled before: ${now.toISOString()}`);
    console.log(`Including actions from the last 2 minutes: ${twoMinutesAgo}`);
    
    // Query for pending actions that are due
    const { data: actions, error } = await supabaseClient
      .from('scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_datetime', now.toISOString());
    
    if (error) {
      console.error("Error fetching scheduled actions:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch scheduled actions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
    
    console.log(`Found ${actions?.length || 0} actions to process`);
    
    // Process each scheduled action
    const results = await Promise.all((actions || []).map(async (action: ScheduledAction) => {
      try {
        console.log(`Processing action ID: ${action.id}, type: ${action.action_type}`);
        
        if (action.action_type === 'webhook') {
          // Process webhook action
          const response = await processWebhookAction(action);
          
          // Update action status based on response
          await updateActionStatus(
            action.id, 
            response.success ? 'completed' : 'failed', 
            action.action_config,
            response
          );
          
          return { id: action.id, success: response.success };
        } else {
          console.log(`Action type ${action.action_type} not supported`);
          return { id: action.id, success: false, error: `Action type ${action.action_type} not supported` };
        }
      } catch (e) {
        console.error(`Error processing action ${action.id}:`, e);
        
        try {
          await updateActionStatus(
            action.id, 
            'failed', 
            action.action_config,
            { 
              success: false, 
              url: action.action_config.url || 'unknown',
              error: e instanceof Error ? e.message : String(e)
            }
          );
        } catch (updateError) {
          console.error(`Error updating action status to failed: ${updateError}`);
        }
          
        return { id: action.id, success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }));
    
    return new Response(JSON.stringify({ 
      processed: results.length, 
      results,
      currentTime: now.toISOString(),
      brasiliaTime: format(brasiliaTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: timezoneBrasilia })
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (e) {
    console.error("Error in scheduled tasks function:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
