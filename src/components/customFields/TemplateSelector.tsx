
import { useState } from "react";
import { FieldTemplate, FIELD_TEMPLATES, templateToRequiredField } from "./CustomFieldTemplates";
import { RequiredField } from "@/types";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  onSelectTemplate: (field: RequiredField) => void;
  stageId: string;
}

export const TemplateSelector = ({ onSelectTemplate, stageId }: TemplateSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const handleSelectTemplate = (template: FieldTemplate) => {
    const requiredField = templateToRequiredField(template, stageId);
    onSelectTemplate(requiredField);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between w-full">
          <span>Selecionar modelo de campo</span>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar modelos de campos..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandGroup heading="Modelos disponíveis">
              {FIELD_TEMPLATES.map((template) => {
                // Dynamically get the icon component
                const IconComponent = (LucideIcons as Record<string, any>)[
                  template.icon.charAt(0).toUpperCase() + template.icon.slice(1)
                ] || LucideIcons.CircleDot;
                
                return (
                  <CommandItem 
                    key={template.id}
                    value={template.id}
                    onSelect={() => handleSelectTemplate(template)}
                    className="flex items-center py-3 px-3 cursor-pointer"
                  >
                    <div className="flex items-center flex-1">
                      <span className="mr-2 rounded-full bg-muted p-1.5 flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 ml-2" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
