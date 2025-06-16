
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Package, TrendingUp, AlertCircle } from "lucide-react";
import { productSuggestionsAPI, ProductSuggestion } from "@/services/productSuggestionsAPI";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductTitleInputProps {
  value: string;
  onChange: (value: string, selectedProduct?: ProductSuggestion) => void;
  required?: boolean;
}

export const ProductTitleInput = ({ value, onChange, required }: ProductTitleInputProps) => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("ProductTitleInput: Starting to load suggestions...");
      
      const data = await productSuggestionsAPI.getPopular(20);
      console.log("ProductTitleInput: Loaded suggestions:", data);
      
      setSuggestions(data);
      
      if (data.length === 0) {
        console.warn("ProductTitleInput: No suggestions returned from API");
      }
    } catch (error) {
      console.error("ProductTitleInput: Error loading product suggestions:", error);
      setError("Erro ao carregar sugestões de produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: ProductSuggestion) => {
    console.log("ProductTitleInput: Product selected:", product);
    setSelectedProduct(product);
    onChange(product.name, product); // Passar o produto selecionado
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue); // Não passar produto quando digitando manualmente
    if (selectedProduct && inputValue !== selectedProduct.name) {
      setSelectedProduct(null);
    }
  };

  const filteredSuggestions = suggestions.filter(product =>
    product.name.toLowerCase().includes(value.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'produto': 'bg-blue-100 text-blue-800',
      'servico': 'bg-green-100 text-green-800',
      'software': 'bg-purple-100 text-purple-800',
      'consultoria': 'bg-orange-100 text-orange-800',
      'treinamento': 'bg-yellow-100 text-yellow-800',
      'desenvolvimento': 'bg-indigo-100 text-indigo-800',
      'personalizado': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="product-title">
        Produto/Serviço {required && "*"}
      </Label>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 px-3 py-2 text-left font-normal"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Package className="h-4 w-4 flex-shrink-0" />
              <span className={cn(
                "truncate",
                !value && "text-muted-foreground"
              )}>
                {value || "Selecione ou digite um produto/serviço"}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar produtos..."
              value={value}
              onValueChange={handleInputChange}
            />
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Carregando sugestões...
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-600 mb-2">
                    {error}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadSuggestions}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestions.length === 0 
                        ? "Nenhuma sugestão disponível" 
                        : "Nenhum produto encontrado"
                      }
                    </p>
                    {value && (
                      <p className="text-xs text-muted-foreground">
                        Digite para criar "{value}" como novo produto
                      </p>
                    )}
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredSuggestions.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => handleSelectProduct(product)}
                      className="flex items-center justify-between p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedProduct?.id === product.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {product.name}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", getCategoryColor(product.category))}
                            >
                              {product.category}
                            </Badge>
                          </div>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {product.price && (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                            {product.usageCount > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {product.usageCount} usos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedProduct && selectedProduct.price && (
        <div className="text-sm text-muted-foreground">
          <span className="text-green-600 font-medium">
            Preço sugerido: {formatCurrency(selectedProduct.price)}
          </span>
        </div>
      )}
    </div>
  );
};
