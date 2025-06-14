
import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'pending-tasks' | 'sales-value' | 'funnel-list';
  title: string;
  enabled: boolean;
  order: number;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'opportunities', type: 'stats', title: 'Total de Oportunidades', enabled: true, order: 0, size: 'small' },
  { id: 'opportunity-value', type: 'stats', title: 'Valor Total de Oportunidades', enabled: true, order: 1, size: 'small' },
  { id: 'sales', type: 'stats', title: 'Vendas Realizadas', enabled: true, order: 2, size: 'small' },
  { id: 'funnels', type: 'stats', title: 'Funis Ativos', enabled: true, order: 3, size: 'small' },
  { id: 'pending-tasks', type: 'pending-tasks', title: 'Tarefas Pendentes', enabled: true, order: 4, size: 'medium' },
  { id: 'sales-value', type: 'sales-value', title: 'Valor das Vendas', enabled: true, order: 5, size: 'medium' },
  { id: 'funnel-list', type: 'funnel-list', title: 'Lista de Funis', enabled: true, order: 6, size: 'full' },
];

export const useDashboardLayout = () => {
  const [widgets, setWidgets] = useLocalStorage<DashboardWidget[]>('dashboard-layout', defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    );
    setWidgets(updatedWidgets);
  };

  const reorderWidgets = (draggedId: string, targetId: string) => {
    const draggedIndex = widgets.findIndex(w => w.id === draggedId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget);

    // Atualizar a ordem
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }));

    setWidgets(updatedWidgets);
  };

  const resetToDefault = () => {
    setWidgets(defaultWidgets);
  };

  const enabledWidgets = widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    enabledWidgets,
    isCustomizing,
    setIsCustomizing,
    updateWidget,
    reorderWidgets,
    resetToDefault
  };
};
