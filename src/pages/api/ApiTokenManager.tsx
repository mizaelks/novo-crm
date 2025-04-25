
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ApiToken {
  id: string;
  name: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

const ApiTokenManager = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar tokens existentes
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("api_tokens").select("*").order("created_at", { ascending: false });
      
      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error("Error fetching API tokens:", error);
      toast.error("Erro ao carregar tokens de API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Criar novo token
  const handleCreateToken = async () => {
    if (!tokenName.trim()) {
      toast.error("O nome do token é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);
      // Gerar um token aleatório
      const tokenValue = crypto.randomUUID();
      
      // Inserir o token no banco
      const { data, error } = await supabase
        .from("api_tokens")
        .insert([{ name: tokenName, token: tokenValue, is_active: true }])
        .select()
        .single();

      if (error) throw error;

      setNewToken(tokenValue);
      setTokens([data, ...tokens]);
      setTokenName("");
    } catch (error) {
      console.error("Error creating API token:", error);
      toast.error("Erro ao criar token de API");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar token para área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Token copiado para a área de transferência");
      },
      () => {
        toast.error("Falha ao copiar token");
      }
    );
  };

  // Excluir token
  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.from("api_tokens").delete().eq("id", tokenToDelete);

      if (error) throw error;

      setTokens(tokens.filter((token) => token.id !== tokenToDelete));
      setTokenToDelete(null);
      toast.success("Token de API excluído com sucesso");
    } catch (error) {
      console.error("Error deleting API token:", error);
      toast.error("Erro ao excluir token de API");
    } finally {
      setIsDeleting(false);
    }
  };

  // Revogar token (inativação)
  const handleRevokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from("api_tokens")
        .update({ is_active: false })
        .eq("id", tokenId);

      if (error) throw error;

      setTokens(tokens.map((token) => 
        token.id === tokenId ? { ...token, is_active: false } : token
      ));
      
      toast.success("Token de API revogado com sucesso");
    } catch (error) {
      console.error("Error revoking API token:", error);
      toast.error("Erro ao revogar token de API");
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciador de Tokens de API</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Token
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Os tokens de API concedem acesso à sua conta. Mantenha-os seguros e nunca compartilhe com outros.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando tokens...</span>
          </div>
        ) : tokens.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <Key className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="font-medium mb-1">Nenhum token encontrado</h3>
                <p>Crie seu primeiro token de API para integrar aplicações externas.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tokens.map((token) => (
            <Card key={token.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{token.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      Criado em {format(new Date(token.created_at), "dd/MM/yyyy HH:mm")}
                      {token.is_active ? (
                        <Badge variant="success" className="ml-2">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2">Revogado</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {token.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeToken(token.id)}
                      >
                        Revogar
                      </Button>
                    ) : null}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setTokenToDelete(token.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center bg-muted p-2 rounded-md">
                  <code className="text-xs font-mono flex-1 truncate">
                    {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 8)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => copyToClipboard(token.token)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal para criar novo token */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setNewToken(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Token de API</DialogTitle>
            <DialogDescription>
              Insira um nome para identificar este token. Ele será usado para autenticação em APIs externas.
            </DialogDescription>
          </DialogHeader>

          {newToken ? (
            <div className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Guarde este token com segurança!</AlertTitle>
                <AlertDescription>
                  Este token só será exibido uma vez. Você não poderá visualizá-lo novamente.
                </AlertDescription>
              </Alert>

              <div className="space-y-1">
                <Label htmlFor="tokenValue">Seu novo token:</Label>
                <div className="flex">
                  <Input
                    id="tokenValue"
                    value={newToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => copyToClipboard(newToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewToken(null);
                }}
              >
                Concluído
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Nome do Token</Label>
                  <Input
                    id="tokenName"
                    placeholder="Ex: Integração com CRM"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateToken}
                  disabled={isSubmitting || !tokenName.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Token"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <Dialog open={!!tokenToDelete} onOpenChange={(open) => !open && setTokenToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Token</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este token de API?
              Esta ação não pode ser desfeita e o token não poderá mais ser usado para autenticação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTokenToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteToken}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Token"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiTokenManager;
