
// Obter a URL base para as API requests
export const BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:54321/functions/v1'
  : `https://ffykgxnmijoonyutchzx.supabase.co/functions/v1`;
