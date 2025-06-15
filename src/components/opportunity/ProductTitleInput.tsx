
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productSuggestionsAPI, ProductSuggestion } from "@/services/productSuggestionsAPI";
import { cn } from "@/lib/utils";

interface ProductTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const ProductTitleInput = ({ 
  value, 
  onChange, 
  label = "Produto/Serviço",
  placeholder = "Digite o nome do produto ou serviço...",
  required = false
}: ProductTitleInputProps) => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ProductSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await productSuggestionsAPI.getPopular(20);
        setSuggestions(data);
      } catch (error) {
        console.error("Error loading product suggestions:", error);
      }
    };
    
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredSuggestions(suggestions.slice(0, 8));
      setIsOpen(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = async (suggestion: ProductSuggestion) => {
    onChange(suggestion.name);
    setIsOpen(false);
    
    // Incrementar contador de uso
    try {
      await productSuggestionsAPI.incrementUsage(suggestion.name);
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      produto: "bg-blue-100 text-blue-800",
      servico: "bg-green-100 text-green-800",
      software: "bg-purple-100 text-purple-800",
      consultoria: "bg-orange-100 text-orange-800",
      treinamento: "bg-yellow-100 text-yellow-800",
      desenvolvimento: "bg-indigo-100 text-indigo-800",
      personalizado: "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="product-title">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        ref={inputRef}
        id="product-title"
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredSuggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="mt-1"
        autoComplete="off"
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto">
          <CardContent className="p-2">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                  index === selectedIndex 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.name}</div>
                  {suggestion.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {suggestion.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getCategoryColor(suggestion.category))}
                  >
                    {suggestion.category}
                  </Badge>
                  {suggestion.usageCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {suggestion.usageCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
