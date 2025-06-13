
import { useState } from 'react';
import { StageAlertConfig } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StageAlertConfigProps {
  alertConfig: StageAlertConfig | undefined;
  onAlertConfigChange: (config: StageAlertConfig) => void;
}

export const StageAlertConfigComponent = ({ 
  alertConfig, 
  onAlertConfigChange 
}: StageAlertConfigProps) => {
  const [config, setConfig] = useState<StageAlertConfig>(
    alertConfig || { enabled: false, maxDaysInStage: 3 }
  );

  const handleChange = (updates: Partial<StageAlertConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onAlertConfigChange(newConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuração de Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="alert-enabled">Configurar alerta</Label>
          <Switch
            id="alert-enabled"
            checked={config.enabled}
            onCheckedChange={(enabled) => handleChange({ enabled })}
          />
        </div>
        
        {config.enabled && (
          <div className="space-y-2">
            <Label htmlFor="max-days">Máximo de dias nessa etapa</Label>
            <Input
              id="max-days"
              type="number"
              min="1"
              max="365"
              value={config.maxDaysInStage}
              onChange={(e) => handleChange({ maxDaysInStage: parseInt(e.target.value) || 3 })}
              placeholder="3"
            />
            <p className="text-xs text-muted-foreground">
              Oportunidades que ficarem {config.maxDaysInStage} dias ou mais nesta etapa 
              receberão um alerta visual no card.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
