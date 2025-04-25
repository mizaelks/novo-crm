
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { format } from 'https://esm.sh/date-fns-tz@2.0.0/format';
import { utcToZonedTime } from 'https://esm.sh/date-fns-tz@2.0.0/utcToZonedTime';

interface ScheduledAction {
  id: string;
  opportunity_id: string;
  action_type: string;
  action_config: any;
  scheduled_datetime: string;
  status: string;
  template_id?: string;
}

interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  url: string;
  target_type: string;
  event: string;
  payload: string;
}

// Configura o cliente Supabase usando as variáveis de ambiente
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Logs para debug, muito úteis para entender o que está acontecendo
console.log("Scheduled tasks function starting...");

serve(async (req) => {
  try {
    const timezoneBrasilia = 'America/Sao_Paulo';
    console.log("Scheduled tasks function handling request");
    
    // Obter a hora atual em UTC
    const now = new Date();
    console.log(`Current UTC time: ${now.toISOString()}`);
    
    // Converter para o fuso horário do Brasil (GMT-3)
    const brasiliaTime = utcToZonedTime(now, timezoneBrasilia);
    console.log(`Brasilia time: ${format(brasiliaTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: timezoneBrasilia })}`);
    
    // Formatar a data atual no formato do banco
    const currentTime = now.toISOString();
    
    // Buscar ações agendadas que estão pendentes e já passaram do tempo de execução
    const { data: actions, error } = await supabaseClient
      .from('scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_datetime', currentTime);
    
    if (error) {
      console.error("Error fetching scheduled actions:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch scheduled actions" }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }
    
    console.log(`Found ${actions?.length || 0} actions to process`);
    
    // Processar cada ação agendada
    const results = await Promise.all((actions || []).map(async (action: ScheduledAction) => {
      try {
        console.log(`Processing action ID: ${action.id}, type: ${action.action_type}`);
        
        if (action.action_type === 'webhook') {
          // Se tiver um template configurado, buscar os dados do template
          let url = action.action_config.url;
          let payload = action.action_config.payload || {};
          let method = action.action_config.method || 'POST';
          
          // Se tiver um template_id, use os dados do template
          if (action.template_id) {
            const { data: template } = await supabaseClient
              .from('webhook_templates')
              .select('*')
              .eq('id', action.template_id)
              .single();
              
            if (template) {
              url = template.url;
              try {
                // Tentar fazer parse do payload do template
                const templatePayload = JSON.parse(template.payload);
                payload = { ...templatePayload, ...payload };
              } catch (e) {
                console.error("Error parsing template payload:", e);
              }
            }
          }
          
          // Buscar dados da oportunidade
          if (action.opportunity_id) {
            const { data: opportunity } = await supabaseClient
              .from('opportunities')
              .select('*')
              .eq('id', action.opportunity_id)
              .single();
              
            if (opportunity) {
              // Adicionar dados da oportunidade ao payload
              payload = {
                ...payload,
                opportunity: opportunity
              };
            }
          }
          
          console.log(`Dispatching webhook to ${url}`);
          console.log(`Payload: ${JSON.stringify(payload)}`);
          
          // Enviar o webhook
          const webhookResponse = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          const success = webhookResponse.ok;
          const responseStatus = webhookResponse.status;
          const responseText = await webhookResponse.text();
          
          console.log(`Webhook response: ${responseStatus}, success: ${success}`);
          console.log(`Response body: ${responseText}`);
          
          // Atualizar o status da ação
          const { error: updateError } = await supabaseClient
            .from('scheduled_actions')
            .update({ 
              status: success ? 'completed' : 'failed',
              action_config: {
                ...action.action_config,
                response: {
                  status: responseStatus,
                  body: responseText,
                  success: success
                }
              }
            })
            .eq('id', action.id);
            
          if (updateError) {
            console.error(`Error updating action status: ${updateError.message}`);
            return { id: action.id, success: false, error: updateError.message };
          }
          
          return { id: action.id, success: success };
        } else {
          console.log(`Action type ${action.action_type} not supported`);
          return { id: action.id, success: false, error: `Action type ${action.action_type} not supported` };
        }
      } catch (e) {
        console.error(`Error processing action ${action.id}:`, e);
        
        // Marcar a ação como falhou
        await supabaseClient
          .from('scheduled_actions')
          .update({ status: 'failed' })
          .eq('id', action.id);
          
        return { id: action.id, success: false, error: e.message };
      }
    }));
    
    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (e) {
    console.error("Error in scheduled tasks function:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
