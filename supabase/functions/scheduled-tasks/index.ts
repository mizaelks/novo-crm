
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Iniciando processamento de ações agendadas...");
    
    // Get current time with appropriate timezone
    const now = new Date();
    console.log(`Horário atual: ${now.toISOString()}`);

    // Fetch pending actions that are due
    const { data: pendingActions, error: fetchError } = await supabase
      .from('scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_datetime', now.toISOString());

    if (fetchError) {
      console.error("Erro ao buscar ações agendadas:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Encontradas ${pendingActions?.length || 0} ações para processar`);

    // Process each action
    const results = [];
    for (const action of pendingActions || []) {
      try {
        console.log(`Processando ação ${action.id} do tipo ${action.action_type}`);
        
        let actionResult = null;
        let successStatus = false;
        
        // Process based on action type
        switch (action.action_type) {
          case 'webhook':
            actionResult = await processWebhook(action);
            successStatus = actionResult.status >= 200 && actionResult.status < 300;
            break;
          case 'email':
            actionResult = await processEmail(action);
            successStatus = actionResult.success;
            break;
          case 'task':
            // Para tarefas, apenas marcamos como concluídas
            actionResult = { success: true, message: "Tarefa marcada como concluída" };
            successStatus = true;
            break;
          default:
            console.warn(`Tipo de ação não reconhecido: ${action.action_type}`);
            actionResult = { error: `Tipo de ação não suportado: ${action.action_type}` };
        }
        
        // Update action status and response
        const updatedConfig = {
          ...action.action_config,
          response: {
            ...actionResult,
            executed_at: new Date().toISOString()
          }
        };
        
        const { error: updateError } = await supabase
          .from('scheduled_actions')
          .update({ 
            status: successStatus ? 'completed' : 'failed',
            action_config: updatedConfig
          })
          .eq('id', action.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar status da ação ${action.id}:`, updateError);
        }
        
        // Verificar se a ação deve mover a oportunidade para próxima etapa
        if (successStatus && action.action_config?.moveToNextStage && action.action_config?.nextStageId) {
          await moveOpportunityToNextStage(supabase, action.opportunity_id, action.action_config.nextStageId);
        }
        
        results.push({
          id: action.id,
          success: successStatus,
          response: actionResult
        });
        
      } catch (err) {
        console.error(`Erro ao processar ação ${action.id}:`, err);
        results.push({
          id: action.id,
          success: false,
          error: err.message || "Erro desconhecido"
        });
        
        // Marcar ação como falha
        const { error: updateError } = await supabase
          .from('scheduled_actions')
          .update({ 
            status: 'failed',
            action_config: {
              ...action.action_config,
              response: {
                success: false,
                error: err.message || "Erro desconhecido",
                executed_at: new Date().toISOString()
              }
            }
          })
          .eq('id', action.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar status da ação ${action.id} após erro:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Erro geral ao processar ações agendadas:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Função para processar webhooks
async function processWebhook(action: any) {
  console.log(`Executando webhook para ${action.id}: ${action.action_config.url}`);
  
  try {
    const method = action.action_config.method || 'POST';
    const url = action.action_config.url;
    
    if (!url) {
      return { status: 400, error: "URL não especificada" };
    }
    
    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    // Adicionar payload no corpo para métodos que suportam
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify({
        ...action.action_config.payload,
        opportunity_id: action.opportunity_id,
        action_id: action.id,
        executed_at: new Date().toISOString()
      });
    }
    
    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();
    let responseBody;
    
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
    
    return {
      status: response.status,
      body: responseBody,
      success: response.ok,
    };
  } catch (error) {
    console.error(`Erro ao executar webhook para ação ${action.id}:`, error);
    return {
      status: 500,
      error: error.message || "Erro ao fazer requisição HTTP",
      success: false,
    };
  }
}

// Função para processar emails (simulado)
async function processEmail(action: any) {
  console.log(`Simulando envio de email para ${action.action_config.email}`);
  
  // Em um cenário real, você usaria um serviço de email como SendGrid, Resend, etc.
  // Aqui apenas simulamos um sucesso
  return {
    success: true,
    message: `Email enviado para ${action.action_config.email}`,
    subject: action.action_config.subject,
  };
}

// Função para mover oportunidade para próxima etapa
async function moveOpportunityToNextStage(supabase: any, opportunityId: string, nextStageId: string) {
  console.log(`Movendo oportunidade ${opportunityId} para etapa ${nextStageId}`);
  
  try {
    const { error } = await supabase
      .from('opportunities')
      .update({ stage_id: nextStageId })
      .eq('id', opportunityId);
      
    if (error) {
      console.error(`Erro ao mover oportunidade ${opportunityId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao mover oportunidade ${opportunityId}:`, error);
    return false;
  }
}
