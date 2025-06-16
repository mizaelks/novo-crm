
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Save, Trophy, X } from "lucide-react";
import { Opportunity, Stage, RequiredField } from "@/types";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";

interface OpportunityCustomFieldsProps {
  opportunity: Opportunity;
  currentStage: Stage | null;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityCustomFields = ({ 
  opportunity, 
  currentStage, 
  onOpportunityUpdated 
}: OpportunityCustomFieldsProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Inicializar form data com campos personalizados existentes
    const initialData = { ...opportunity.customFields || {} };
    
    // Adicionar motivos de win/loss se a etapa exigir
    if (currentStage?.isWinStage && opportunity.winReason) {
      initialData._winReason = opportunity.winReason;
    }
    if (currentStage?.isLossStage && opportunity.lossReason) {
      initialData._lossReason = opportunity.lossReason;
    }
    
    setFormData(initialData);
    setHasChanges(false);
  }, [opportunity, currentStage]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _winReason, _lossReason, ...customFields } = formData;
      
      const updateData: any = {
        customFields
      };
      
      // Incluir motivos de win/loss se necessário
      if (_winReason !== undefined) {
        updateData.winReason = _winReason;
      }
      if (_lossReason !== undefined) {
        updateData.lossReason = _lossReason;
      }
      
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, updateData);
      
      if (updatedOpportunity) {
        onOpportunityUpdated(updatedOpportunity);
        setHasChanges(false);
        toast.success("Campos personalizados salvos com sucesso");
      }
    } catch (error) {
      console.error("Error saving custom fields:", error);
      toast.error("Erro ao salvar campos personalizados");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: RequiredField) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Digite ${field.name.toLowerCase()}`}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Digite ${field.name.toLowerCase()}`}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            placeholder={`Digite ${field.name.toLowerCase()}`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>Sim</Label>
          </div>
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Digite ${field.name.toLowerCase()}`}
          />
        );
    }
  };

  const stageRequiredFields = currentStage?.requiredFields || [];
  const needsWinReason = currentStage?.isWinStage && currentStage?.winReasonRequired;
  const needsLossReason = currentStage?.isLossStage && currentStage?.lossReasonRequired;
  
  // Campos personalizados que não são campos obrigatórios da etapa
  const customFieldsOnly = Object.keys(formData).filter(key => 
    !key.startsWith('_') && 
    !stageRequiredFields.some(field => field.name === key)
  );

  return (
    <div className="space-y-6 p-6">
      {/* Campos obrigatórios da etapa */}
      {stageRequiredFields.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">Campos Obrigatórios da Etapa</CardTitle>
              <Badge variant="secondary">{currentStage?.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stageRequiredFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="font-medium">
                  {field.name}
                  {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Motivos de Win/Loss */}
      {(needsWinReason || needsLossReason) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">
                {needsWinReason ? "Motivo da Vitória" : "Motivo da Perda"}
              </CardTitle>
              <Badge variant={needsWinReason ? "default" : "destructive"}>
                {needsWinReason ? "Ganho" : "Perda"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsWinReason && (
              <div className="space-y-2">
                <Label className="font-medium">Motivo da Vitória *</Label>
                <Select 
                  value={formData._winReason || ''} 
                  onValueChange={(val) => handleFieldChange('_winReason', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo da vitória" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStage.winReasons?.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {needsLossReason && (
              <div className="space-y-2">
                <Label className="font-medium">Motivo da Perda *</Label>
                <Select 
                  value={formData._lossReason || ''} 
                  onValueChange={(val) => handleFieldChange('_lossReason', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo da perda" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStage.lossReasons?.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outros campos personalizados */}
      {customFieldsOnly.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Outros Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customFieldsOnly.map((fieldName) => (
              <div key={fieldName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{fieldName}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newData = { ...formData };
                      delete newData[fieldName];
                      setFormData(newData);
                      setHasChanges(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={formData[fieldName] || ''}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  placeholder={`Digite ${fieldName.toLowerCase()}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Botão de salvar */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}

      {/* Mensagem quando não há campos */}
      {stageRequiredFields.length === 0 && !needsWinReason && !needsLossReason && customFieldsOnly.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum campo personalizado configurado.</p>
          <p className="text-sm mt-2">
            Os campos obrigatórios da etapa "{currentStage?.name}" aparecerão aqui quando configurados.
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunityCustomFields;
