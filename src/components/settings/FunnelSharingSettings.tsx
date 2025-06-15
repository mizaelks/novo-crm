
import { useState, useEffect } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useUserRole } from "@/hooks/useUserRole";
import { FunnelSharingConfig } from "@/components/funnel/FunnelSharingConfig";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Funnel {
  id: string;
  name: string;
  is_shared?: boolean;
}

export const FunnelSharingSettings = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const { isManager, isAdmin } = useUserRole();

  useEffect(() => {
    if (isManager || isAdmin) {
      loadFunnels();
    }
  }, [isManager, isAdmin]);

  const loadFunnels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('id, name, is_shared')
        .order('name', { ascending: true });

      if (error) throw error;
      setFunnels(data || []);
    } catch (error) {
      handleError(error, "Erro ao carregar funis");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isManager && !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <FunnelSharingConfig 
      funnels={funnels} 
      onUpdate={loadFunnels} 
    />
  );
};
