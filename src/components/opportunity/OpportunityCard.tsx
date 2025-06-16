
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail, Building, Plus, Eye, Clock } from "lucide-react";
import { Opportunity, Stage } from "@/types";
import { OpportunityAlertIndicator } from "./OpportunityAlertIndicator";
import { OpportunityTasksBadge } from "./OpportunityTasksBadge";

interface OpportunityCardProps {
  opportunity: Opportunity;
  stage: Stage;
  onView?: (opportunity: Opportunity) => void;
  onAddTask?: (opportunity: Opportunity) => void;
  onAddField?: (opportunity: Opportunity) => void;
}

export const OpportunityCard = ({ 
  opportunity, 
  stage, 
  onView, 
  onAddTask, 
  onAddField 
}: OpportunityCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const shouldShowAlert = () => {
    if (!stage.alertConfig?.enabled) return false;
    
    const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
    const daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysInStage >= stage.alertConfig.maxDaysInStage;
  };

  return (
    <Draggable draggableId={opportunity.id} index={0}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg rotate-3 bg-blue-50' : ''
          }`}
          onClick={() => onView?.(opportunity)}
        >
          <CardContent className="p-3">
            <div className="space-y-2">
              {/* Header com título e valor */}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm leading-tight flex-1 mr-2">
                  {opportunity.title}
                </h4>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    {formatCurrency(opportunity.value)}
                  </Badge>
                  {shouldShowAlert() && <OpportunityAlertIndicator />}
                </div>
              </div>

              {/* Cliente */}
              {opportunity.client && (
                <p className="text-xs text-muted-foreground truncate">
                  {opportunity.client}
                </p>
              )}

              {/* Informações de contato em uma linha compacta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  {opportunity.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[60px]">
                        {opportunity.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                      </span>
                    </div>
                  )}
                  {opportunity.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[80px]">{opportunity.email}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(opportunity.createdAt)}</span>
                </div>
              </div>

              {/* Empresa */}
              {opportunity.company && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building className="h-3 w-3 mr-1" />
                  <span className="truncate">{opportunity.company}</span>
                </div>
              )}

              {/* Badge de tarefas pendentes */}
              <OpportunityTasksBadge opportunityId={opportunity.id} />

              {/* Footer com ações */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(opportunity);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTask?.(opportunity);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Tarefa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddField?.(opportunity);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Campo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};
