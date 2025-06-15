
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Package, TrendingUp } from "lucide-react";
import { productSuggestionsAPI, ProductSuggestion } from "@/services/productSuggestionsAPI";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ProductManagementProps {
  isAdmin: boolean;
}

export const ProductManagement = ({ isAdmin }: ProductManagementProps) => {
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSuggestion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "produto",
    price: "",
    isActive: true
  });

  const categories = [
    { value: "produto", label: "Produto" },
    { value: "servico", label: "Serviço" },
    { value: "software", label: "Software" },
    { value: "consultoria", label: "Consultoria" },
    { value: "treinamento", label: "Treinamento" },
    { value: "desenvolvimento", label: "Desenvolvimento" },
    { value: "personalizado", label: "Personalizado" }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productSuggestionsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : undefined,
        isActive: formData.isActive
      };

      if (editingProduct) {
        await productSuggestionsAPI.update(editingProduct.id, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await productSuggestionsAPI.create(productData);
        toast.success("Produto criado com sucesso!");
      }

      setFormData({
        name: "",
        description: "",
        category: "produto",
        price: "",
        isActive: true
      });
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEdit = (product: ProductSuggestion) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price?.toString() || "",
      isActive: product.isActive
    });
    setEditingProduct(product);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await productSuggestionsAPI.delete(id);
      toast.success("Produto excluído com sucesso!");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded-md" />
            <div className="h-4 bg-muted animate-pulse rounded-md" />
            <div className="h-4 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gerenciamento de Produtos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure produtos e serviços para facilitar a criação de oportunidades
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setFormData({
                    name: "",
                    description: "",
                    category: "produto",
                    price: "",
                    isActive: true
                  });
                  setEditingProduct(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do produto/serviço"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do produto/serviço"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Preço Padrão</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum produto configurado ainda</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione produtos para facilitar a criação de oportunidades
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(product.category)}
                        </Badge>
                        {product.usageCount > 0 && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {product.usageCount} usos
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.description}
                        </p>
                      )}
                      {product.price && (
                        <p className="text-sm font-medium text-green-600">
                          Preço padrão: {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
