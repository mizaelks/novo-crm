
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpportunityOwnerBadgeProps {
  userId: string;
  funnelIsShared?: boolean;
  size?: "sm" | "md";
}

export const OpportunityOwnerBadge = ({ 
  userId, 
  funnelIsShared = false, 
  size = "sm" 
}: OpportunityOwnerBadgeProps) => {
  const { user: currentUser } = useAuth();
  
  // Só mostra o badge se o funil for compartilhado ou se não for o próprio usuário
  const shouldShow = funnelIsShared || (currentUser?.id !== userId);
  
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!shouldShow) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: shouldShow
  });

  if (!shouldShow || !profile) {
    return null;
  }

  const isCurrentUser = currentUser?.id === userId;
  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email;

  return (
    <Badge 
      variant={isCurrentUser ? "default" : "secondary"} 
      className={`flex items-center gap-1 ${size === "sm" ? "text-xs px-1.5 py-0.5" : ""}`}
    >
      <User className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {isCurrentUser ? "Você" : displayName}
    </Badge>
  );
};
