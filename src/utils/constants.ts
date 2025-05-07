
// Obter a URL base para as API requests
export const BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:54321/functions/v1'
  : `https://ffykgxnmijoonyutchzx.supabase.co/functions/v1`;

// Import formatCurrency from dateUtils to re-export it
import { formatCurrency } from "@/services/utils/dateUtils";

// Re-export formatCurrency so it can be imported from either file
export { formatCurrency };
