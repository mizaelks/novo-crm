
import { useState, useEffect, useMemo } from "react";
import { ScheduledAction } from "@/types";
import { scheduledActionAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ActionStatusBadge } from "./ActionStatusBadge";
import { ActionHeader } from "./ActionHeader";
import { ActionContent } from "./ActionContent";

interface ScheduledActionListProps {
  opportunityId: string;
}

const ScheduledActionList = ({ opportunityId }: ScheduledActionListProps) => {
  const [actions, setActions] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { ConfirmDialog, showConfirmation } = useConfirmDialog();

  const loadActions = async () => {
    try {
      setLoading(true);
      const fetchedActions = await scheduledActionAPI.getByOpportunityId(opportunityId);
      setActions(fetchedActions);
    } catch (error) {
      console.error("Error loading scheduled actions:", error);
      toast.error("Erro ao carregar ações agendadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [opportunityId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActions();
    setRefreshing(false);
  };

  const handleDeleteAction = async (actionId: string) => {
    const confirmDelete = await showConfirmation(
      "Excluir ação agendada", 
      "Tem certeza que deseja excluir esta ação agendada? Esta ação não pode ser desfeita."
    );
    
    if (confirmDelete) {
      try {
        const success = await scheduledActionAPI.delete(actionId);
        if (success) {
          setActions(actions.filter(action => action.id !== actionId));
          toast.success("Ação agendada excluída com sucesso");
        } else {
          toast.error("Erro ao excluir ação agendada");
        }
      } catch (error) {
        console.error("Error deleting scheduled action:", error);
        toast.error("Erro ao excluir ação agendada");
      }
    }
  };

  if (loading) {
    return <ActionListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ações Agendadas</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Atualizar
        </Button>
      </div>

      {actions.length === 0 ? (
        <EmptyState />
      ) : (
        actions.map((action) => (
          <ActionCard 
            key={action.id} 
            action={action} 
            onDelete={handleDeleteAction} 
          />
        ))
      )}

      <ConfirmDialog />
    </div>
  );
};

// ActionCard component for displaying individual scheduled actions
const ActionCard = ({ action, onDelete }: { 
  action: ScheduledAction; 
  onDelete: (id: string) => void;
}) => {
  return (
    <Card key={action.id} className="mb-4">
      <ActionHeader 
        action={action} 
        onDelete={() => onDelete(action.id)} 
      />
      <CardContent className="pt-0">
        <ActionContent action={action} />
      </CardContent>
    </Card>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="text-center p-4 text-muted-foreground">
    Nenhuma ação agendada encontrada.
  </div>
);

// Loading skeleton
const ActionListSkeleton = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span>Carregando ações agendadas...</span>
  </div>
);

export default ScheduledActionList;
