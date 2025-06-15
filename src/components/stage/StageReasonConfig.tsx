
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface StageReasonConfigProps {
  winReasonRequired: boolean;
  lossReasonRequired: boolean;
  winReasons: string[];
  lossReasons: string[];
  onWinReasonRequiredChange: (required: boolean) => void;
  onLossReasonRequiredChange: (required: boolean) => void;
  onWinReasonsChange: (reasons: string[]) => void;
  onLossReasonsChange: (reasons: string[]) => void;
  isWinStage?: boolean;
  isLossStage?: boolean;
}

export const StageReasonConfig = ({
  winReasonRequired,
  lossReasonRequired,
  winReasons,
  lossReasons,
  onWinReasonRequiredChange,
  onLossReasonRequiredChange,
  onWinReasonsChange,
  onLossReasonsChange,
  isWinStage,
  isLossStage
}: StageReasonConfigProps) => {
  const [newWinReason, setNewWinReason] = useState("");
  const [newLossReason, setNewLossReason] = useState("");

  const addWinReason = () => {
    if (newWinReason.trim()) {
      onWinReasonsChange([...winReasons, newWinReason.trim()]);
      setNewWinReason("");
    }
  };

  const removeWinReason = (index: number) => {
    onWinReasonsChange(winReasons.filter((_, i) => i !== index));
  };

  const addLossReason = () => {
    if (newLossReason.trim()) {
      onLossReasonsChange([...lossReasons, newLossReason.trim()]);
      setNewLossReason("");
    }
  };

  const removeLossReason = (index: number) => {
    onLossReasonsChange(lossReasons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Configuração de Motivos</Label>
        <p className="text-sm text-muted-foreground">
          Configure motivos obrigatórios para etapas de vitória e perda
        </p>
      </div>

      {isWinStage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Motivo de Vitória Obrigatório</Label>
            <Switch
              checked={winReasonRequired}
              onCheckedChange={onWinReasonRequiredChange}
            />
          </div>
          
          {winReasonRequired && (
            <div className="space-y-3 pl-4 border-l-2 border-green-200">
              <Label className="text-sm">Motivos de Vitória Disponíveis</Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar motivo de vitória"
                  value={newWinReason}
                  onChange={(e) => setNewWinReason(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWinReason()}
                />
                <Button type="button" size="sm" onClick={addWinReason}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {winReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm">{reason}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWinReason(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isLossStage && (
        <>
          {isWinStage && <Separator />}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Motivo de Perda Obrigatório</Label>
              <Switch
                checked={lossReasonRequired}
                onCheckedChange={onLossReasonRequiredChange}
              />
            </div>
            
            {lossReasonRequired && (
              <div className="space-y-3 pl-4 border-l-2 border-red-200">
                <Label className="text-sm">Motivos de Perda Disponíveis</Label>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar motivo de perda"
                    value={newLossReason}
                    onChange={(e) => setNewLossReason(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLossReason()}
                  />
                  <Button type="button" size="sm" onClick={addLossReason}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {lossReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                      <span className="text-sm">{reason}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLossReason(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
