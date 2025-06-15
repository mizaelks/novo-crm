
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText } from 'lucide-react';
import { Opportunity } from '@/types';

interface OpportunityQuickActionsProps {
  opportunity: Opportunity;
  onAddTask: () => void;
  onAddField: () => void;
}

export const OpportunityQuickActions = ({ 
  opportunity, 
  onAddTask, 
  onAddField 
}: OpportunityQuickActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 p-2 border-t bg-gray-50/50 text-xs">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          onAddTask();
        }}
      >
        <Calendar className="h-3 w-3" />
        <span>tarefa</span>
      </Button>
      
      <span className="text-muted-foreground">|</span>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          onAddField();
        }}
      >
        <FileText className="h-3 w-3" />
        <span>campo</span>
      </Button>
    </div>
  );
};
