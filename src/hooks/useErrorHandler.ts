
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    console.error('Error occurred:', error, context ? `Context: ${context}` : '');
    
    // Convert error to a proper string message
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.details) {
      // Handle Supabase relationship errors specifically
      if (typeof error.details === 'string') {
        errorMessage = `Erro no banco de dados: ${error.details}`;
      } else if (Array.isArray(error.details)) {
        errorMessage = `Erro de relacionamento no banco de dados: ${error.message || 'Erro desconhecido'}`;
      } else {
        errorMessage = `Erro no sistema: ${error.message || 'Erro desconhecido'}`;
      }
    } else if (error?.code) {
      // Handle specific error codes
      switch (error.code) {
        case 'PGRST116':
          errorMessage = 'Nenhum registro encontrado';
          break;
        case '23505':
          errorMessage = 'Este registro já existe no sistema';
          break;
        case '23503':
          errorMessage = 'Erro de relacionamento entre dados';
          break;
        default:
          errorMessage = `Erro do sistema (${error.code}): ${error.message || 'Erro desconhecido'}`;
      }
    }
    
    return errorMessage;
  };

  return { handleError };
};
