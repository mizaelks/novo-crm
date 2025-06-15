
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DatePreset {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

interface DatePresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DatePresetsDialog = ({ open, onOpenChange }: DatePresetsDialogProps) => {
  const [presets, setPresets] = useState<DatePreset[]>([
    {
      id: "1",
      name: "Último Trimestre",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31)
    }
  ]);
  const [newPresetName, setNewPresetName] = useState("");
  const [newStartDate, setNewStartDate] = useState<Date>();
  const [newEndDate, setNewEndDate] = useState<Date>();

  const handleAddPreset = () => {
    if (newPresetName && newStartDate && newEndDate) {
      const newPreset: DatePreset = {
        id: Date.now().toString(),
        name: newPresetName,
        startDate: newStartDate,
        endDate: newEndDate
      };
      setPresets([...presets, newPreset]);
      setNewPresetName("");
      setNewStartDate(undefined);
      setNewEndDate(undefined);
    }
  };

  const handleRemovePreset = (id: string) => {
    setPresets(presets.filter(preset => preset.id !== id));
  };

  const handleSave = () => {
    console.log("Salvando presets de data:", presets);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Presets de Data</DialogTitle>
          <DialogDescription>
            Crie presets personalizados para filtros de data rápidos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Presets Existentes</Label>
            
            {presets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum preset criado ainda.</p>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{preset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(preset.startDate, "dd/MM/yyyy")} - {format(preset.endDate, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePreset(preset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Criar Novo Preset</Label>
            
            <div className="space-y-2">
              <Label htmlFor="preset-name" className="text-sm">Nome do Preset</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Ex: Último Semestre"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newStartDate ? format(newStartDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStartDate}
                      onSelect={setNewStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEndDate ? format(newEndDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEndDate}
                      onSelect={setNewEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              onClick={handleAddPreset}
              disabled={!newPresetName || !newStartDate || !newEndDate}
              className="w-full"
            >
              Adicionar Preset
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Presets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatePresetsDialog;
