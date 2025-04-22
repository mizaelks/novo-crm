
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key (special admin privileges)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Check if admin user already exists
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      throw searchError;
    }

    // Look for the specified email in the user list
    const existingUser = existingUsers?.users?.find(
      (user) => user.email === "mizaellimadesigner@gmail.com"
    );

    let result;
    if (!existingUser) {
      // Create the default user if it doesn't exist
      const { data, error } = await supabase.auth.admin.createUser({
        email: "mizaellimadesigner@gmail.com",
        password: "@Pequenino",
        email_confirm: true,
      });

      if (error) {
        throw error;
      }
      
      result = {
        message: "Default user created successfully",
        userId: data.user?.id,
      };
    } else {
      // If user exists, update their password to ensure it's correct
      const { error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: "@Pequenino", email_confirm: true }
      );
      
      if (error) {
        throw error;
      }
      
      result = {
        message: "Default user already exists, password has been reset",
        userId: existingUser.id,
      };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error creating default user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
