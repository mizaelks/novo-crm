
import { useState } from "react";
import { Stage } from "@/types";
import { EditIcon, BadgeCheck, XCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EditStageDialog from "./EditStageDialog";
import { Button } from "@/components/ui/button";

interface StageHeaderProps {
  stage: Stage;
  dragHandleProps?: any;
  updateStage?: (updatedStage: Stage) => void;
  onAddOpportunity?: () => void;
}

const StageHeader = ({ stage, dragHandleProps, updateStage, onAddOpportunity }: StageHeaderProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Calculate text color based on stage color for optimal contrast
  const getTextColor = (backgroundColor: string) => {
    // Remove the '#' and convert to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black for light colors, white for dark colors
    return brightness > 125 ? 'text-black' : 'text-white';
  };
  
  const stageColor = stage.color || '#CCCCCC';
  const textColor = getTextColor(stageColor);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleAddOpportunityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddOpportunity) {
      onAddOpportunity();
    }
  };

  return (
    <div 
      className="p-2 flex flex-col gap-2 rounded-t-md"
      style={{ backgroundColor: stageColor }}
      {...dragHandleProps}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className={`font-medium ${textColor}`}>{stage.name}</h3>
          {stage.isWinStage && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Vitória
            </Badge>
          )}
          {stage.isLossStage && (
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              Perda
            </Badge>
          )}
        </div>
        
        <div className="flex items-center">
          <Badge variant="secondary" className={textColor}>
            {stage.opportunities.length}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className={`ml-2 h-8 w-8 p-0 ${textColor} hover:bg-opacity-20 hover:bg-white`}
            onClick={handleEditClick}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {onAddOpportunity && (
        <Button
          variant="ghost"
          size="sm"
          className={`w-full text-xs ${textColor} hover:bg-opacity-20 hover:bg-white border border-opacity-30 border-white`}
          onClick={handleAddOpportunityClick}
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova oportunidade
        </Button>
      )}
      
      {updateStage && (
        <EditStageDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          stageId={stage.id}
          onStageUpdated={updateStage}
        />
      )}
    </div>
  );
};

export default StageHeader;
