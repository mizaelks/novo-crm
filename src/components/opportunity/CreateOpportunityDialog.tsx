
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { opportunityAPI } from "@/services/opportunityAPI";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ProductTitleInput } from "./ProductTitleInput";
import { productSuggestionsAPI } from "@/services/productSuggestionsAPI";

interface CreateOpportunityDialogProps {
  stageId: string;
  funnelId: string;
  onOpportunityCreated: () => void;
}

export const CreateOpportunityDialog = ({ stageId, funnelId, onOpportunityCreated }: CreateOpportunityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    value: "",
    phone: "",
    email: "",
    company: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.client.trim()) {
      toast.error("Produto/Serviço e Cliente são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await opportunityAPI.create({
        title: formData.title,
        client: formData.client,
        value: parseFloat(formData.value) || 0,
        stageId,
        funnelId,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        customFields: {}
      });

      // Incrementar contador de uso do produto
      if (formData.title.trim()) {
        try {
          await productSuggestionsAPI.incrementUsage(formData.title);
        } catch (error) {
          console.error("Error incrementing product usage:", error);
        }
      }

      toast.success("Oportunidade criada com sucesso!");
      setFormData({
        title: "",
        client: "",
        value: "",
        phone: "",
        email: "",
        company: ""
      });
      setOpen(false);
      onOpportunityCreated();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error("Erro ao criar oportunidade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Oportunidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Oportunidade</DialogTitle>
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
              {loading ? "Criando..." : "Criar Oportunidade"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityDialog;
