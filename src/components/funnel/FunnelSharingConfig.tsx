
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Lock, Users } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Funnel {
  id: string;
  name: string;
  is_shared?: boolean;
}

interface FunnelSharingConfigProps {
  funnels: Funnel[];
  onUpdate: () => void;
}

export const FunnelSharingConfig = ({ funnels, onUpdate }: FunnelSharingConfigProps) => {
  const { isManager, isAdmin } = useUserRole();
  const [updating, setUpdating] = useState<string | null>(null);

  if (!isManager && !isAdmin) {
    return null;
  }

  const handleToggleSharing = async (funnelId: string, isShared: boolean) => {
    setUpdating(funnelId);
    try {
      const { error } = await supabase
        .from('funnels')
        .update({ is_shared: isShared })
        .eq('id', funnelId);

      if (error) throw error;

      toast.success(isShared ? "Funil compartilhado com sucesso!" : "Funil agora é privado");
      onUpdate();
    } catch (error) {
      console.error("Error updating funnel sharing:", error);
      toast.error("Erro ao atualizar configuração do funil");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Configuração de Compartilhamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnels.map((funnel) => (
          <div key={funnel.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {funnel.is_shared ? (
                  <Users className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium">{funnel.name}</span>
              </div>
              <Badge variant={funnel.is_shared ? "default" : "secondary"}>
                {funnel.is_shared ? "Compartilhado" : "Privado"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor={`sharing-${funnel.id}`} className="text-sm">
                Compartilhar
              </Label>
              <Switch
                id={`sharing-${funnel.id}`}
                checked={funnel.is_shared || false}
                onCheckedChange={(checked) => handleToggleSharing(funnel.id, checked)}
                disabled={updating === funnel.id}
              />
            </div>
          </div>
        ))}
        {funnels.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum funil encontrado
          </p>
        )}
      </CardContent>
    </Card>
  );
};
