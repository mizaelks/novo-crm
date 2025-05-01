
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { format } from 'https://esm.sh/date-fns@3.3.1/format';
import { toZonedTime } from 'https://esm.sh/date-fns-tz@3.0.0/toZonedTime';
import { isPast } from 'https://esm.sh/date-fns@3.3.1/isPast';
import { addSeconds } from 'https://esm.sh/date-fns@3.3.1/addSeconds';

interface ScheduledAction {
  id: string;
  opportunity_id: string;
  action_type: string;
  action_config: any;
  scheduled_datetime: string;
  status: string;
  template_id?: string;
}

// Configure Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Scheduled tasks function initialized");

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
    
    // Fetch pending scheduled actions with a small buffer to catch recent ones
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
          let url = action.action_config.url;
          let payload = action.action_config.payload || {};
          let method = action.action_config.method || 'POST';
          
          if (!url) {
            throw new Error("No URL specified for webhook action");
          }
          
          console.log(`Action config: ${JSON.stringify(action.action_config)}`);
          
          // If template_id exists, use template data
          if (action.template_id) {
            console.log(`Using template ID: ${action.template_id}`);
            const { data: template, error: templateError } = await supabaseClient
              .from('webhook_templates')
              .select('*')
              .eq('id', action.template_id)
              .single();
              
            if (templateError) {
              console.error("Error fetching template:", templateError);
              throw new Error(`Template fetch error: ${templateError.message}`);
            }
              
            if (template) {
              console.log(`Template found: ${template.name}`);
              url = template.url;
              try {
                const templatePayload = JSON.parse(template.payload);
                payload = { ...templatePayload, ...payload };
                console.log(`Template payload parsed successfully`);
              } catch (e) {
                console.error("Error parsing template payload:", e);
                throw new Error(`Template payload parse error: ${e instanceof Error ? e.message : String(e)}`);
              }
            } else {
              console.log(`No template found for ID: ${action.template_id}`);
              throw new Error(`No template found for ID: ${action.template_id}`);
            }
          }
          
          // Fetch opportunity data if needed
          if (action.opportunity_id) {
            const { data: opportunity, error: opportunityError } = await supabaseClient
              .from('opportunities')
              .select('*')
              .eq('id', action.opportunity_id)
              .single();
              
            if (opportunityError) {
              console.error("Error fetching opportunity:", opportunityError);
              throw new Error(`Opportunity fetch error: ${opportunityError.message}`);
            }
              
            if (opportunity) {
              payload = {
                ...payload,
                opportunity: opportunity
              };
              console.log(`Opportunity data added to payload`);
            } else {
              console.log(`No opportunity found for ID: ${action.opportunity_id}`);
            }
          }
          
          console.log(`Dispatching webhook to ${url}`);
          console.log(`Payload: ${JSON.stringify(payload)}`);
          console.log(`Method: ${method}`);
          
          try {
            // Verify URL is valid
            new URL(url);
            
            const webhookResponse = await fetch(url, {
              method: method,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Supabase Scheduled Action'
              },
              body: JSON.stringify(payload)
            });
            
            const success = webhookResponse.ok;
            const responseStatus = webhookResponse.status;
            const responseText = await webhookResponse.text();
            
            console.log(`Webhook response: ${responseStatus}, success: ${success}`);
            console.log(`Response body: ${responseText}`);
            
            // Update action status
            const { error: updateError } = await supabaseClient
              .from('scheduled_actions')
              .update({ 
                status: success ? 'completed' : 'failed',
                action_config: {
                  ...action.action_config,
                  response: {
                    status: responseStatus,
                    body: responseText,
                    success: success,
                    executed_at: new Date().toISOString(),
                    error: success ? null : 'Failed with status ' + responseStatus
                  }
                }
              })
              .eq('id', action.id);
              
            if (updateError) {
              console.error(`Error updating action status: ${updateError.message}`);
              return { id: action.id, success: false, error: updateError.message };
            }
            
            return { id: action.id, success };
          } catch (fetchError) {
            console.error(`Error sending webhook: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
            
            const { error: updateError } = await supabaseClient
              .from('scheduled_actions')
              .update({ 
                status: 'failed',
                action_config: {
                  ...action.action_config,
                  response: {
                    error: fetchError instanceof Error ? fetchError.message : String(fetchError),
                    success: false,
                    executed_at: new Date().toISOString()
                  }
                }
              })
              .eq('id', action.id);
              
            if (updateError) {
              console.error(`Error updating action status: ${updateError.message}`);
            }
            
            return { id: action.id, success: false, error: fetchError instanceof Error ? fetchError.message : String(fetchError) };
          }
        } else {
          console.log(`Action type ${action.action_type} not supported`);
          return { id: action.id, success: false, error: `Action type ${action.action_type} not supported` };
        }
      } catch (e) {
        console.error(`Error processing action ${action.id}:`, e);
        
        try {
          await supabaseClient
            .from('scheduled_actions')
            .update({ 
              status: 'failed',
              action_config: {
                ...action.action_config,
                response: {
                  error: e instanceof Error ? e.message : String(e),
                  success: false,
                  executed_at: new Date().toISOString()
                }
              }
            })
            .eq('id', action.id);
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
