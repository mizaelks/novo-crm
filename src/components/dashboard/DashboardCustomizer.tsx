
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, GripVertical, RotateCcw } from "lucide-react";
import { useDashboardLayout, DashboardWidget } from "@/hooks/useDashboardLayout";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const DashboardCustomizer = () => {
  const { 
    widgets, 
    updateWidget, 
    reorderWidgets, 
    resetToDefault,
    isCustomizing,
    setIsCustomizing 
  } = useDashboardLayout();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const draggedWidget = widgets[result.source.index];
    const targetWidget = widgets[result.destination.index];

    if (draggedWidget && targetWidget) {
      reorderWidgets(draggedWidget.id, targetWidget.id);
    }
  };

  const getSizeLabel = (size?: string) => {
    switch (size) {
      case 'small': return 'Pequeno';
      case 'medium': return 'Médio';
      case 'large': return 'Grande';
      case 'full': return 'Largura Total';
      default: return 'Médio';
    }
  };

  return (
    <Sheet open={isCustomizing} onOpenChange={setIsCustomizing}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Personalizar Dashboard</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Componentes</h3>
            <Button variant="ghost" size="sm" onClick={resetToDefault}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Resetar
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 pr-4"
                  >
                    {widgets.map((widget, index) => (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-3 border rounded-lg bg-background ${
                              snapshot.isDragging ? 'shadow-md' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab hover:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{widget.title}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {getSizeLabel(widget.size)}
                                  </Badge>
                                </div>
                              </div>
                              <Switch
                                checked={widget.enabled}
                                onCheckedChange={(enabled) =>
                                  updateWidget(widget.id, { enabled })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardCustomizer;
