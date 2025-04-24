
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    if (path.length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid API path"
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Path format: /api/resource/[id/action]
    const resource = path[1];
    const idOrAction = path[2] || null;
    const action = path[3] || null;

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing or invalid authentication token"
      }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const { data: apiToken, error: tokenError } = await supabaseClient
      .from('api_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !apiToken) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid API token"
      }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Log API usage
    await supabaseClient.from('api_logs').insert({
      token_id: apiToken.id,
      method: req.method,
      path: url.pathname,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    let result;
    // Process the request based on resource and method
    switch (resource) {
      case 'funnels':
        result = await handleFunnelRequest(req, supabaseClient, idOrAction, action);
        break;
      case 'stages':
        result = await handleStageRequest(req, supabaseClient, idOrAction, action);
        break;
      case 'opportunities':
        result = await handleOpportunityRequest(req, supabaseClient, idOrAction, action);
        break;
      case 'webhooks':
        result = await handleWebhookRequest(req, supabaseClient, idOrAction, action);
        break;
      case 'tokens':
        result = await handleTokenRequest(req, supabaseClient, idOrAction, action);
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          error: "Resource not found"
        }), { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
    }

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("API Error:", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});

// Handle token requests (new function)
async function handleTokenRequest(req, supabaseClient, id, action) {
  switch (req.method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabaseClient
          .from('api_tokens')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseClient
          .from('api_tokens')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      }
    case 'POST':
      const postBody = await req.json();
      const { data: newToken, error: createError } = await supabaseClient
        .from('api_tokens')
        .insert({
          name: postBody.name,
          token: crypto.randomUUID().replace(/-/g, ''),
          is_active: true
        })
        .select()
        .single();
        
      if (createError) throw createError;
      return newToken;
    case 'PATCH':
      if (!id) throw new Error("ID is required for update");
      const patchBody = await req.json();
      const { data: updatedToken, error: updateError } = await supabaseClient
        .from('api_tokens')
        .update({
          is_active: patchBody.is_active
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedToken;
    case 'DELETE':
      if (!id) throw new Error("ID is required for delete");
      
      // First check if token exists and is inactive
      if (action === 'permanent') {
        // Permanently delete the token
        const { error: deleteError } = await supabaseClient
          .from('api_tokens')
          .delete()
          .eq('id', id);
          
        if (deleteError) throw deleteError;
        
        // Also delete associated logs
        await supabaseClient
          .from('api_logs')
          .delete()
          .eq('token_id', id);
          
        return { id, permanently_deleted: true };
      } else {
        // Just deactivate the token (soft delete)
        const { data: deactivatedToken, error: updateError } = await supabaseClient
          .from('api_tokens')
          .update({
            is_active: false
          })
          .eq('id', id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        return { id, deactivated: true, token: deactivatedToken };
      }
    default:
      throw new Error(`Method ${req.method} not allowed for tokens`);
  }
}

// Handle funnel requests
async function handleFunnelRequest(req, supabaseClient, id, action) {
  switch (req.method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabaseClient
          .from('funnels')
          .select('*, stages(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseClient
          .from('funnels')
          .select('*, stages(*)')
          .order('order', { ascending: true });
          
        if (error) throw error;
        return data;
      }
    case 'POST':
      const postBody = await req.json();
      const { data: newFunnel, error: createError } = await supabaseClient
        .from('funnels')
        .insert({
          name: postBody.name,
          description: postBody.description
        })
        .select()
        .single();
        
      if (createError) throw createError;
      return newFunnel;
    case 'PUT':
    case 'PATCH':
      if (!id) throw new Error("ID is required for update");
      const patchBody = await req.json();
      const { data: updatedFunnel, error: updateError } = await supabaseClient
        .from('funnels')
        .update({
          name: patchBody.name,
          description: patchBody.description
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedFunnel;
    case 'DELETE':
      if (!id) throw new Error("ID is required for delete");
      const { error: deleteError } = await supabaseClient
        .from('funnels')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      return { id, deleted: true };
    default:
      throw new Error(`Method ${req.method} not allowed for funnels`);
  }
}

// Handle stage requests
async function handleStageRequest(req, supabaseClient, id, action) {
  switch (req.method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabaseClient
          .from('stages')
          .select('*, opportunities(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseClient
          .from('stages')
          .select('*, opportunities(*)')
          .order('order', { ascending: true });
          
        if (error) throw error;
        return data;
      }
    case 'POST':
      const postBody = await req.json();
      const { data: newStage, error: createError } = await supabaseClient
        .from('stages')
        .insert({
          name: postBody.name,
          description: postBody.description,
          funnel_id: postBody.funnelId
        })
        .select()
        .single();
        
      if (createError) throw createError;
      return newStage;
    case 'PUT':
    case 'PATCH':
      if (!id) throw new Error("ID is required for update");
      const patchBody = await req.json();
      const { data: updatedStage, error: updateError } = await supabaseClient
        .from('stages')
        .update({
          name: patchBody.name,
          description: patchBody.description,
          funnel_id: patchBody.funnelId
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedStage;
    case 'DELETE':
      if (!id) throw new Error("ID is required for delete");
      const { error: deleteError } = await supabaseClient
        .from('stages')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      return { id, deleted: true };
    default:
      throw new Error(`Method ${req.method} not allowed for stages`);
  }
}

// Handle opportunity requests
async function handleOpportunityRequest(req, supabaseClient, id, action) {
  switch (req.method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabaseClient
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseClient
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      }
    case 'POST':
      const postBody = await req.json();
      const { data: newOpportunity, error: createError } = await supabaseClient
        .from('opportunities')
        .insert({
          title: postBody.title,
          value: postBody.value,
          client: postBody.client,
          company: postBody.company || null,
          phone: postBody.phone || null,
          email: postBody.email || null,
          stage_id: postBody.stageId,
          funnel_id: postBody.funnelId,
          custom_fields: postBody.customFields || null
        })
        .select()
        .single();
        
      if (createError) throw createError;
      return newOpportunity;
    case 'PUT':
    case 'PATCH':
      if (!id) throw new Error("ID is required for update");
      const patchBody = await req.json();
      const updateData = {};
      
      // Only include fields that are provided
      if (patchBody.title !== undefined) updateData.title = patchBody.title;
      if (patchBody.value !== undefined) updateData.value = patchBody.value;
      if (patchBody.client !== undefined) updateData.client = patchBody.client;
      if (patchBody.company !== undefined) updateData.company = patchBody.company;
      if (patchBody.phone !== undefined) updateData.phone = patchBody.phone;
      if (patchBody.email !== undefined) updateData.email = patchBody.email;
      if (patchBody.stageId !== undefined) updateData.stage_id = patchBody.stageId;
      if (patchBody.funnelId !== undefined) updateData.funnel_id = patchBody.funnelId;
      if (patchBody.customFields !== undefined) updateData.custom_fields = patchBody.customFields;
      
      const { data: updatedOpportunity, error: updateError } = await supabaseClient
        .from('opportunities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedOpportunity;
    case 'DELETE':
      if (!id) throw new Error("ID is required for delete");
      const { error: deleteError } = await supabaseClient
        .from('opportunities')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      return { id, deleted: true };
    default:
      if (action === 'move' && req.method === 'PATCH') {
        const moveBody = await req.json();
        const { data: movedOpportunity, error: moveError } = await supabaseClient
          .from('opportunities')
          .update({
            stage_id: moveBody.stageId
          })
          .eq('id', id)
          .select()
          .single();
          
        if (moveError) throw moveError;
        return movedOpportunity;
      }
      throw new Error(`Method ${req.method} with action ${action} not allowed for opportunities`);
  }
}

// Handle webhook requests
async function handleWebhookRequest(req, supabaseClient, id, action) {
  switch (req.method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabaseClient
          .from('webhooks')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseClient
          .from('webhooks')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      }
    case 'POST':
      if (action === 'inbound') {
        // Handle inbound webhook
        const payload = await req.json();
        if (!payload.title || !payload.stageId || !payload.funnelId) {
          throw new Error("Missing required fields: title, stageId, funnelId");
        }
        
        const { data: newOpportunity, error: createError } = await supabaseClient
          .from('opportunities')
          .insert({
            title: payload.title,
            client: payload.client || 'External client',
            value: payload.value || 0,
            company: payload.company || null,
            phone: payload.phone || null,
            email: payload.email || null,
            stage_id: payload.stageId,
            funnel_id: payload.funnelId
          })
          .select()
          .single();
          
        if (createError) throw createError;
        return newOpportunity;
      } else {
        // Create new webhook
        const postBody = await req.json();
        const { data: newWebhook, error: createError } = await supabaseClient
          .from('webhooks')
          .insert({
            target_type: postBody.targetType,
            target_id: postBody.targetId,
            url: postBody.url,
            event: postBody.event
          })
          .select()
          .single();
          
        if (createError) throw createError;
        return newWebhook;
      }
    case 'DELETE':
      if (!id) throw new Error("ID is required for delete");
      const { error: deleteError } = await supabaseClient
        .from('webhooks')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      return { id, deleted: true };
    default:
      throw new Error(`Method ${req.method} not allowed for webhooks`);
  }
}
