
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { opportunityAPI } from "@/services/opportunityAPI";
import { toast } from "sonner";
import { Opportunity } from "@/types";
import { ProductTitleInput } from "./ProductTitleInput";
import { productSuggestionsAPI } from "@/services/productSuggestionsAPI";

interface EditOpportunityDialogProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

export const EditOpportunityDialog = ({ 
  opportunity, 
  open, 
  onOpenChange, 
  onOpportunityUpdated 
}: EditOpportunityDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    value: "",
    phone: "",
    email: "",
    company: ""
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        client: opportunity.client || "",
        value: opportunity.value?.toString() || "",
        phone: opportunity.phone || "",
        email: opportunity.email || "",
        company: opportunity.company || ""
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    
    if (!formData.title.trim() || !formData.client.trim()) {
      toast.error("Produto/Serviço e Cliente são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        title: formData.title,
        client: formData.client,
        value: parseFloat(formData.value) || 0,
        phone: formData.phone,
        email: formData.email,
        company: formData.company
      });

      if (updatedOpportunity) {
        // Incrementar contador de uso do produto se mudou
        if (formData.title.trim() && formData.title !== opportunity.title) {
          try {
            await productSuggestionsAPI.incrementUsage(formData.title);
          } catch (error) {
            console.error("Error incrementing product usage:", error);
          }
        }

        toast.success("Oportunidade atualizada com sucesso!");
        onOpportunityUpdated(updatedOpportunity);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Erro ao atualizar oportunidade");
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Oportunidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductTitleInput
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            required
          />
          
          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0,00"
            />
          </div>
          
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOpportunityDialog;
