
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    console.error('Error occurred:', error, context ? `Context: ${context}` : '');
    
    // Convert error to a proper string message
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.details && Array.isArray(error.details)) {
      // Handle Supabase relationship errors specifically
      errorMessage = `Erro de relacionamento no banco de dados: ${error.message || 'Erro desconhecido'}`;
    }
    
    return errorMessage;
  };

  return { handleError };
};
