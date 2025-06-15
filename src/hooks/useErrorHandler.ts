
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ErrorState {
  message: string;
  type: 'network' | 'validation' | 'permission' | 'unknown';
  details?: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: any, context?: string) => {
    console.error("Error occurred:", error, "Context:", context);
    
    let errorState: ErrorState = {
      message: "Ocorreu um erro inesperado",
      type: 'unknown'
    };

    // Tratar diferentes tipos de erro
    if (error?.code === 'PGRST116' || error?.message?.includes('No rows found')) {
      errorState = {
        message: "Dados não encontrados",
        type: 'unknown',
        details: "O item solicitado não foi encontrado ou você não tem permissão para acessá-lo"
      };
    } else if (error?.code === 'PGRST301' || error?.message?.includes('permission denied')) {
      errorState = {
        message: "Acesso negado",
        type: 'permission',
        details: "Você não tem permissão para realizar esta ação"
      };
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorState = {
        message: "Erro de conexão",
        type: 'network',
        details: "Verifique sua conexão com a internet e tente novamente"
      };
    } else if (error?.message?.includes('validation') || error?.errors) {
      errorState = {
        message: "Dados inválidos",
        type: 'validation',
        details: error?.errors?.join(', ') || error?.message || "Verifique os dados informados"
      };
    } else if (typeof error === 'string') {
      errorState = {
        message: error,
        type: 'unknown'
      };
    } else if (error?.message) {
      errorState = {
        message: error.message,
        type: 'unknown',
        details: error?.details || error?.hint
      };
    }

    setError(errorState);
    
    // Mostrar toast com base no tipo de erro
    const toastMessage = context ? `${context}: ${errorState.message}` : errorState.message;
    
    switch (errorState.type) {
      case 'network':
        toast.error(toastMessage, {
          description: "Verifique sua conexão e tente novamente",
          action: {
            label: "Tentar novamente",
            onClick: () => window.location.reload()
          }
        });
        break;
      case 'permission':
        toast.error(toastMessage, {
          description: "Entre em contato com o administrador se necessário"
        });
        break;
      case 'validation':
        toast.error(toastMessage, {
          description: errorState.details
        });
        break;
      default:
        toast.error(toastMessage, {
          description: errorState.details
        });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    setIsRetrying(true);
    try {
      await retryFn();
      clearError();
      toast.success("Operação realizada com sucesso");
    } catch (error) {
      handleError(error, "Tentativa de retry");
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retry,
    isRetrying
  };
};
