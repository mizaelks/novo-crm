
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verificar se o usuário atual é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verificar se é admin
    const { data: isAdminData, error: adminError } = await supabaseAdmin.rpc('is_admin', { _user_id: user.id });
    
    if (adminError || !isAdminData) {
      throw new Error('Access denied: Admin privileges required');
    }

    const { email, firstName, lastName, role } = await req.json();

    if (!email || !firstName || !lastName || !role) {
      throw new Error('Missing required fields');
    }

    console.log(`Sending invite to: ${email} with role: ${role}`);

    // Por enquanto, apenas simular o envio do email
    // Em produção, aqui você integraria com um serviço de email como Resend
    const inviteData = {
      email,
      firstName,
      lastName,
      role,
      invitedBy: user.email,
      inviteToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
    };

    // Log para debug
    console.log('Invite data:', inviteData);

    // TODO: Integrar com serviço de email
    // const emailResponse = await sendInviteEmail(inviteData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso!',
        inviteData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
