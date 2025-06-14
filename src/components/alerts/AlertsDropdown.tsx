
import React from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts } from '@/hooks/useAlerts';
import { useNavigate } from 'react-router-dom';

const AlertsDropdown = () => {
  const { alerts, unreadCount, markAsRead } = useAlerts();
  const navigate = useNavigate();

  const handleAlertClick = (alert: any) => {
    markAsRead(alert.id);
    navigate(alert.route);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'scheduled_task':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'opportunity_stuck':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'stage_deadline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">
          Alertas {unreadCount > 0 && `(${unreadCount} novos)`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Nenhum alerta ativo</p>
            <p className="text-xs">Tudo está em ordem! 🎉</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={`p-4 cursor-pointer border-b last:border-b-0 ${
                  !alert.isRead ? 'bg-accent/50' : ''
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{alert.title}</span>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {alert.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertsDropdown;
