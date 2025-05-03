
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stage, StageFormData, RequiredField } from "@/types";
import { stageAPI } from "@/services/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida"),
  isWinStage: z.boolean().optional(),
  isLossStage: z.boolean().optional()
}).refine(data => {
  // Can't be both win and loss
  return !(data.isWinStage && data.isLossStage);
}, {
  message: "Uma etapa não pode ser de vitória e perda ao mesmo tempo",
  path: ["isWinStage"]
});

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  onStageUpdated: (stage: Stage) => void;
}

const EditStageDialog = ({
  open,
  onOpenChange,
  stageId,
  onStageUpdated
}: EditStageDialogProps) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "checkbox" | "select">("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [addingField, setAddingField] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#CCCCCC",
      isWinStage: false,
      isLossStage: false
    }
  });

  useEffect(() => {
    const loadStage = async () => {
      if (open && stageId) {
        setLoading(true);
        console.log("Carregando dados da etapa:", stageId);
        
        try {
          const stageData = await stageAPI.getById(stageId);
          console.log("Etapa carregada:", stageData);
          
          if (stageData) {
            setStage(stageData);
            setRequiredFields(stageData.requiredFields || []);
            form.reset({
              name: stageData.name,
              description: stageData.description || "",
              color: stageData.color || "#CCCCCC",
              isWinStage: stageData.isWinStage || false,
              isLossStage: stageData.isLossStage || false
            });
          }
        } catch (error) {
          console.error("Error loading stage:", error);
          toast.error("Erro ao carregar dados da etapa");
        } finally {
          setLoading(false);
        }
      }
    };

    loadStage();
  }, [open, stageId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!stage) {
      console.error("Stage data not loaded");
      toast.error("Dados da etapa não carregados");
      return;
    }
    
    try {
      console.log("Enviando atualização para a etapa:", stageId);
      console.log("Dados:", {
        name: values.name,
        description: values.description,
        funnelId: stage.funnelId,
        color: values.color,
        isWinStage: values.isWinStage,
        isLossStage: values.isLossStage,
        requiredFields: requiredFields
      });
      
      setIsSubmitting(true);
      
      const updatedStage = await stageAPI.update(stageId, {
        name: values.name,
        description: values.description,
        funnelId: stage.funnelId,
        color: values.color,
        isWinStage: values.isWinStage,
        isLossStage: values.isLossStage,
        requiredFields: requiredFields
      });
      
      console.log("Resposta da API:", updatedStage);
      
      if (updatedStage) {
        onStageUpdated(updatedStage);
        toast.success("Etapa atualizada com sucesso!");
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar etapa");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar etapa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRequiredField = () => {
    if (!newFieldName.trim()) {
      toast.error("O nome do campo é obrigatório");
      return;
    }

    const newField: RequiredField = {
      id: crypto.randomUUID(),
      name: newFieldName.trim(),
      type: newFieldType,
      isRequired: true,
      stageId: stageId
    };

    // Add options for select fields
    if (newFieldType === "select" && newFieldOptions) {
      newField.options = newFieldOptions.split(",").map(option => option.trim());
    }

    setRequiredFields([...requiredFields, newField]);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setAddingField(false);
    toast.success("Campo adicionado");
  };

  const handleRemoveField = (fieldId: string) => {
    setRequiredFields(requiredFields.filter(field => field.id !== fieldId));
    toast.success("Campo removido");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar etapa</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da etapa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Qualificação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Etapa de qualificação de leads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor da etapa</FormLabel>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input type="color" {...field} className="w-14 h-10 p-1" />
                      </FormControl>
                      <Input 
                        placeholder="#CCCCCC" 
                        value={field.value} 
                        onChange={e => field.onChange(e.target.value)}
                        className="font-mono"
                        maxLength={7}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isWinStage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Etapa de Vitória</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Oportunidades nesta etapa são consideradas ganhas
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isLossStage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Etapa de Perda</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Oportunidades nesta etapa são consideradas perdidas
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Campos obrigatórios</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAddingField(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Adicionar campo
                  </Button>
                </div>
                
                {addingField && (
                  <div className="border rounded-md p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FormLabel>Nome do campo</FormLabel>
                        <Input 
                          value={newFieldName} 
                          onChange={e => setNewFieldName(e.target.value)} 
                          placeholder="Ex: Valor da proposta"
                        />
                      </div>
                      <div>
                        <FormLabel>Tipo do campo</FormLabel>
                        <Select 
                          value={newFieldType} 
                          onValueChange={(value: any) => setNewFieldType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="select">Seleção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {newFieldType === "select" && (
                      <div>
                        <FormLabel>Opções (separadas por vírgula)</FormLabel>
                        <Input 
                          value={newFieldOptions} 
                          onChange={e => setNewFieldOptions(e.target.value)} 
                          placeholder="Ex: Opção 1, Opção 2, Opção 3"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setAddingField(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleAddRequiredField}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
                
                {requiredFields.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum campo obrigatório configurado
                  </div>
                ) : (
                  <div className="space-y-2">
                    {requiredFields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline">
                            {field.type === "text" && "Texto"}
                            {field.type === "number" && "Número"}
                            {field.type === "date" && "Data"}
                            {field.type === "checkbox" && "Checkbox"}
                            {field.type === "select" && "Seleção"}
                          </Badge>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
