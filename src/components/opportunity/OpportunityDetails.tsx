
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, User, DollarSign, Building, Phone, Mail } from "lucide-react";
import { Opportunity } from "@/types";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";

interface OpportunityDetailsProps {
  opportunity: Opportunity;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityDetails = ({ opportunity, onOpportunityUpdated }: OpportunityDetailsProps) => {
  const [formData, setFormData] = useState({
    title: opportunity.title || '',
    client: opportunity.client || '',
    value: opportunity.value || 0,
    phone: opportunity.phone || '',
    email: opportunity.email || '',
    company: opportunity.company || ''
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, formData);
      
      if (updatedOpportunity) {
        onOpportunityUpdated(updatedOpportunity);
        setHasChanges(false);
        toast.success("Detalhes salvos com sucesso");
      }
    } catch (error) {
      console.error("Error saving opportunity details:", error);
      toast.error("Erro ao salvar detalhes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Oportunidade</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Digite o título"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => handleFieldChange('client', e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleFieldChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleFieldChange('company', e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Oportunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Data de Criação</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">ID da Oportunidade</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {opportunity.id}
              </p>
            </div>
          </div>
          
          {opportunity.userId && (
            <div>
              <Label className="text-sm font-medium">Criado por</Label>
              <Badge variant="secondary">{opportunity.userId}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetails;
