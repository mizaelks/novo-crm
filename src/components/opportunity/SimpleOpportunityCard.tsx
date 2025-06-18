
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity, RequiredField } from "@/types";
import { Draggable } from "react-beautiful-dnd";
import { MoreVertical, User, Building2, Mail, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { requiredElementsService } from "@/services/requiredElementsService";

interface SimpleOpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTask?: () => void;
  onAddField?: () => void;
  stageId: string;
}

const SimpleOpportunityCard = ({ 
  opportunity, 
  index, 
  onEdit, 
  onDelete, 
  onAddTask, 
  onAddField,
  stageId 
}: SimpleOpportunityCardProps) => {
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const [missingFieldsCount, setMissingFieldsCount] = useState(0);

  useEffect(() => {
    const loadRequiredFields = async () => {
      try {
        const { requiredFields: stageRequiredFields } = await requiredElementsService.getStageRequirements(stageId);
        setRequiredFields(stageRequiredFields || []);
        
        // Calculate missing required fields
        const missing = (stageRequiredFields || []).filter(field => {
          if (!field.isRequired) return false;
          
          const fieldValue = opportunity.customFields?.[field.name];
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            return true;
          }
          if (field.type === 'checkbox' && fieldValue !== true) {
            return true;
          }
          return false;
        });
        
        setMissingFieldsCount(missing.length);
      } catch (error) {
        console.error('Error loading required fields:', error);
      }
    };

    if (stageId) {
      loadRequiredFields();
    }
  }, [stageId, opportunity.customFields]);

  const hasRequiredFields = requiredFields.length > 0;
  const allRequiredFieldsFilled = hasRequiredFields && missingFieldsCount === 0;

  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'rotate-2 shadow-lg ring-2 ring-primary/20' : ''
          } ${missingFieldsCount > 0 ? 'border-amber-200 bg-amber-50/50' : ''}`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {opportunity.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(opportunity.value || 0)}
                  </span>
                  {hasRequiredFields && (
                    <div className="flex items-center gap-1">
                      {allRequiredFieldsFilled ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {missingFieldsCount} campo{missingFieldsCount !== 1 ? 's' : ''} obrigatório{missingFieldsCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddTask}>
                    Adicionar Tarefa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddField}>
                    Adicionar Campo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              {opportunity.client && (
                <div className="flex items-center text-xs text-gray-600">
                  <User className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{opportunity.client}</span>
                </div>
              )}
              
              {opportunity.company && (
                <div className="flex items-center text-xs text-gray-600">
                  <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{opportunity.company}</span>
                </div>
              )}
              
              {opportunity.email && (
                <div className="flex items-center text-xs text-gray-600">
                  <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{opportunity.email}</span>
                </div>
              )}
              
              {opportunity.phone && (
                <div className="flex items-center text-xs text-gray-600">
                  <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{opportunity.phone}</span>
                </div>
              )}

              {/* Show required fields status */}
              {hasRequiredFields && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">
                    Campos obrigatórios: {requiredFields.length - missingFieldsCount}/{requiredFields.length}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {requiredFields.slice(0, 3).map(field => {
                      const fieldValue = opportunity.customFields?.[field.name];
                      const isFilled = fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && 
                                      (field.type !== 'checkbox' || fieldValue === true);
                      
                      return (
                        <Badge 
                          key={field.id} 
                          variant="outline" 
                          className={`text-xs ${
                            isFilled 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {field.name}
                        </Badge>
                      );
                    })}
                    {requiredFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{requiredFields.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default SimpleOpportunityCard;
