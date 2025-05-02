
import { ScheduledAction } from "@/types";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ActionStatusBadge } from "./ActionStatusBadge";

interface ActionHeaderProps {
  action: ScheduledAction;
  onDelete: () => void;
}

export const ActionHeader = ({ action, onDelete }: ActionHeaderProps) => {
  const formatActionType = (type: string) => {
    switch (type) {
      case 'webhook':
        return 'Webhook';
      case 'email':
        return 'Email';
      case 'notification':
        return 'Notificação';
      default:
        return type;
    }
  };

  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-base">{formatActionType(action.actionType)}</CardTitle>
          <CardDescription>
            Agendado para: {format(new Date(action.scheduledDateTime), "dd/MM/yyyy HH:mm")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <ActionStatusBadge status={action.status} />
          {action.status === 'pending' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-destructive" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
