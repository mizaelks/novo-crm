
import { useState, useEffect } from "react";
import { stageHistoryAPI } from "@/services/api";
import { StageHistoryEntry } from "@/types/stageHistory";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OpportunityHistoryTabProps {
  opportunityId: string;
}

export const OpportunityHistoryTab = ({ opportunityId }: OpportunityHistoryTabProps) => {
  const [history, setHistory] = useState<StageHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const historyData = await stageHistoryAPI.getOpportunityHistory(opportunityId);
        setHistory(historyData);
      } catch (error) {
        console.error("Error loading opportunity history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      loadHistory();
    }
  }, [opportunityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum histórico de movimentação encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Histórico de Movimentações</h3>
        <Badge variant="secondary" className="ml-auto">
          {history.length} movimentações
        </Badge>
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => (
          <Card key={entry.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {entry.fromStageId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Etapa anterior</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Nova etapa</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-xs">
                        Entrada no funil
                      </Badge>
                    </div>
                  )}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {format(entry.movedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {entry.userId ? `Usuário: ${entry.userId.slice(0, 8)}...` : "Sistema"}
                  </span>
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs">
                    Mais recente
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
