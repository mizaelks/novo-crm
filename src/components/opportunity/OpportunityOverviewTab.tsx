
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity, Funnel, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { funnelAPI, stageAPI } from "@/services/api";
import { Calendar, DollarSign, Building2, Phone, Mail, User, AlertTriangle } from "lucide-react";
import OpportunityMoveActions from "./OpportunityMoveActions";

interface OpportunityOverviewTabProps {
  opportunity: Opportunity;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityOverviewTab = ({ 
  opportunity, 
  onOpportunityUpdated 
}: OpportunityOverviewTabProps) => {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFunnelAndStage = async () => {
      try {
        const [funnelData, stageData] = await Promise.all([
          funnelAPI.getById(opportunity.funnelId),
          stageAPI.getById(opportunity.stageId)
        ]);
        setFunnel(funnelData);
        setStage(stageData);
      } catch (error) {
        console.error("Error loading funnel and stage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnelAndStage();
  }, [opportunity.funnelId, opportunity.stageId]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-lg" />
    </div>;
  }

  const requiredFields = stage?.requiredFields || [];
  const missingRequiredFields = requiredFields.filter(field => {
    const fieldValue = opportunity.customFields?.[field.name];
    return !fieldValue || fieldValue === '' || (field.type === 'checkbox' && fieldValue !== true);
  });

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações da Oportunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cliente:</span>
                <span className="text-sm">{opportunity.client}</span>
              </div>
              
              {opportunity.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Empresa:</span>
                  <span className="text-sm">{opportunity.company}</span>
                </div>
              )}
              
              {opportunity.value && opportunity.value > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(opportunity.value)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {opportunity.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Telefone:</span>
                  <span className="text-sm">{opportunity.phone}</span>
                </div>
              )}
              
              {opportunity.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{opportunity.email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Criado em:</span>
                <span className="text-sm">
                  {new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">{funnel?.name}</Badge>
            <Badge variant="secondary">{stage?.name}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Campos Obrigatórios */}
      {requiredFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Campos Obrigatórios da Etapa
              {missingRequiredFields.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {missingRequiredFields.length} pendente(s)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missingRequiredFields.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Existem {missingRequiredFields.length} campo(s) obrigatório(s) não preenchido(s)
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFields.map((field) => {
                const fieldValue = opportunity.customFields?.[field.name];
                const isEmpty = !fieldValue || fieldValue === '' || (field.type === 'checkbox' && fieldValue !== true);
                
                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{field.name}:</span>
                      {isEmpty && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    <span className={`text-sm ${isEmpty ? 'text-muted-foreground italic' : ''}`}>
                      {isEmpty ? 'Não preenchido' : String(fieldValue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Movimentação */}
      {funnel && stage && (
        <OpportunityMoveActions
          opportunity={opportunity}
          currentFunnel={funnel}
          currentStage={stage}
          onOpportunityMoved={onOpportunityUpdated}
        />
      )}
    </div>
  );
};

export default OpportunityOverviewTab;
