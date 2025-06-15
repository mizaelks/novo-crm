
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Opportunity } from "@/types";
import { toast } from "sonner";

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
  onFieldAdded: () => void;
}

export const AddFieldDialog = ({ 
  open, 
  onOpenChange, 
  opportunity, 
  onFieldAdded 
}: AddFieldDialogProps) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would add the field to the opportunity
      // For now, just show a success message
      toast.success("Campo adicionado com sucesso!");
      onFieldAdded();
      onOpenChange(false);
      setFieldName("");
      setFieldValue("");
    } catch (error) {
      toast.error("Erro ao adicionar campo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Campo - {opportunity.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fieldName">Nome do Campo</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Ex: Telefone, Observações..."
            />
          </div>
          <div>
            <Label htmlFor="fieldValue">Valor</Label>
            <Input
              id="fieldValue"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Valor do campo"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
