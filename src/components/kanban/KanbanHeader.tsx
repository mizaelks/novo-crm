
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Funnel } from "@/types";

interface KanbanHeaderProps {
  funnel: Funnel;
  onNewStage: () => void;
}

const KanbanHeader = ({ funnel, onNewStage }: KanbanHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold">{funnel.name}</h2>
        <p className="text-muted-foreground">{funnel.description}</p>
      </div>
      <Button onClick={onNewStage}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Etapa
      </Button>
    </div>
  );
};

export default KanbanHeader;
