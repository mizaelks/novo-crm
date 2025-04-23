
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Running scheduled tasks function");
    
    // Get pending scheduled actions that are due
    const now = new Date().toISOString();
    const { data: pendingActions, error: fetchError } = await supabase
      .from('scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_datetime', now);
      
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${pendingActions?.length || 0} pending actions to process`);
    
    if (!pendingActions?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: "No pending actions found",
        processed: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const results = [];
    
    // Process each scheduled action
    for (const action of pendingActions) {
      try {
        console.log(`Processing action ${action.id} of type ${action.action_type}`);
        
        if (action.action_type === 'webhook' && action.action_config.url) {
          // Get opportunity data for payload
          const { data: opportunity } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', action.opportunity_id)
            .single();
            
          if (opportunity) {
            // Prepare webhook payload
            const payload = {
              event: 'scheduled.webhook',
              data: {
                scheduledActionId: action.id,
                opportunity
              }
            };
            
            // Send webhook
            const webhookResponse = await fetch(action.action_config.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            
            const webhookSuccess = webhookResponse.ok;
            
            // Update action status
            const { error: updateError } = await supabase
              .from('scheduled_actions')
              .update({
                status: webhookSuccess ? 'completed' : 'failed'
              })
              .eq('id', action.id);
              
            if (updateError) {
              console.error(`Error updating action status: ${updateError.message}`);
            }
            
            results.push({
              id: action.id,
              success: webhookSuccess,
              statusCode: webhookResponse.status
            });
          }
        }
        
        // Add support for other action types later
        
      } catch (actionError) {
        console.error(`Error processing action ${action.id}:`, actionError);
        
        // Update action status to failed
        await supabase
          .from('scheduled_actions')
          .update({
            status: 'failed'
          })
          .eq('id', action.id);
          
        results.push({
          id: action.id,
          success: false,
          error: actionError.message
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error in scheduled tasks function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
