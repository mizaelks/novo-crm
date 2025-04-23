
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Copy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiToken {
  id: string;
  name: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

const ApiTokenManager = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  // Function to generate a secure random token
  const generateSecureToken = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const loadTokens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('created_at', { ascending: false }) as { data: ApiToken[] | null; error: any };
      
      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error("Error loading API tokens:", error);
      toast.error("Erro ao carregar tokens de API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleCreateToken = async () => {
    if (!tokenName.trim()) {
      toast.error("Por favor, informe um nome para o token");
      return;
    }

    try {
      setGeneratingToken(true);
      const newTokenValue = generateSecureToken();
      
      const { data, error } = await supabase
        .from('api_tokens')
        .insert([{
          name: tokenName,
          token: newTokenValue,
          is_active: true
        }])
        .select()
        .single() as { data: ApiToken | null; error: any };
      
      if (error) throw error;
      
      setNewToken(newTokenValue);
      setTokenName("");
      toast.success("Token de API gerado com sucesso!");
      await loadTokens();
    } catch (error) {
      console.error("Error creating API token:", error);
      toast.error("Erro ao criar token de API");
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleRevokeToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: false })
        .eq('id', id) as { error: any };
      
      if (error) throw error;
      
      toast.success("Token de API revogado com sucesso!");
      await loadTokens();
    } catch (error) {
      console.error("Error revoking API token:", error);
      toast.error("Erro ao revogar token de API");
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado para a área de transferência!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciador de Tokens de API</h1>
        <Link to="/api">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar para Documentação
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar novo token de API</CardTitle>
            <CardDescription>
              Crie um novo token de acesso para integrar sistemas externos com a API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">Nome do Token</Label>
                <Input
                  id="token-name"
                  placeholder="Ex: Integração CRM"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Use um nome descritivo para identificar o propósito deste token
                </p>
              </div>
              
              <Button 
                onClick={handleCreateToken} 
                disabled={generatingToken || !tokenName.trim()}
                className="w-full"
              >
                {generatingToken ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : "Gerar novo token"}
              </Button>
              
              {newToken && (
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <div className="space-y-2">
                    <AlertDescription className="font-medium text-amber-800">
                      Guarde este token em um lugar seguro! Ele não será exibido novamente.
                    </AlertDescription>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newToken} 
                        readOnly 
                        className="font-mono text-sm" 
                      />
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => handleCopyToken(newToken)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tokens existentes</CardTitle>
            <CardDescription>
              Gerencie os tokens de API existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Carregando tokens...</p>
            ) : tokens.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Nenhum token encontrado</p>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.id} className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Criado em {formatDate(token.created_at)}
                      </p>
                      <div className="mt-1 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${token.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs">{token.is_active ? 'Ativo' : 'Revogado'}</span>
                      </div>
                    </div>
                    {token.is_active && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeToken(token.id)}
                      >
                        Revogar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiTokenManager;
