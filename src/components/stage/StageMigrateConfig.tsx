
import React, { useState, useEffect } from 'react';
import { StageMigrateConfig, Funnel, Stage } from '@/types';
import { funnelAPI, stageAPI } from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Copy } from 'lucide-react';

interface StageMigrateConfigProps {
  migrateConfig: StageMigrateConfig;
  onMigrateConfigChange: (config: StageMigrateConfig) => void;
  currentFunnelId: string;
}

export const StageMigrateConfigComponent: React.FC<StageMigrateConfigProps> = ({
  migrateConfig,
  onMigrateConfigChange,
  currentFunnelId
}) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFunnels = async () => {
      try {
        setLoading(true);
        const allFunnels = await funnelAPI.getAll();
        // Filter out the current funnel
        const otherFunnels = allFunnels.filter(funnel => funnel.id !== currentFunnelId);
        setFunnels(otherFunnels);
      } catch (error) {
        console.error('Error loading funnels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnels();
  }, [currentFunnelId]);

  useEffect(() => {
    const loadStages = async () => {
      if (migrateConfig.enabled && migrateConfig.targetFunnelId) {
        try {
          const funnelStages = await stageAPI.getByFunnelId(migrateConfig.targetFunnelId);
          setStages(funnelStages);
        } catch (error) {
          console.error('Error loading stages:', error);
        }
      } else {
        setStages([]);
      }
    };

    loadStages();
  }, [migrateConfig.targetFunnelId, migrateConfig.enabled]);

  const handleEnabledChange = (enabled: boolean) => {
    onMigrateConfigChange({
      ...migrateConfig,
      enabled,
      targetFunnelId: enabled ? migrateConfig.targetFunnelId : '',
      targetStageId: enabled ? migrateConfig.targetStageId : ''
    });
  };

  const handleFunnelChange = (funnelId: string) => {
    onMigrateConfigChange({
      ...migrateConfig,
      targetFunnelId: funnelId,
      targetStageId: '' // Reset stage when funnel changes
    });
  };

  const handleStageChange = (stageId: string) => {
    onMigrateConfigChange({
      ...migrateConfig,
      targetStageId: stageId
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Migração para Funil
        </CardTitle>
        <CardDescription>
          Configure para clonar automaticamente oportunidades que chegarem nesta etapa para outro funil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="migrate-enabled"
            checked={migrateConfig.enabled}
            onCheckedChange={handleEnabledChange}
          />
          <Label htmlFor="migrate-enabled">
            Ativar migração automática para funil
          </Label>
        </div>

        {migrateConfig.enabled && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="target-funnel">Funil de destino</Label>
              <Select
                value={migrateConfig.targetFunnelId}
                onValueChange={handleFunnelChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funil de destino" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {migrateConfig.targetFunnelId && (
              <div className="space-y-2">
                <Label htmlFor="target-stage">Etapa inicial no funil de destino</Label>
                <Select
                  value={migrateConfig.targetStageId}
                  onValueChange={handleStageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {migrateConfig.targetFunnelId && migrateConfig.targetStageId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <ArrowRight className="h-4 w-4" />
                <span>
                  Oportunidades serão clonadas para o funil selecionado mantendo a original nesta etapa
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
