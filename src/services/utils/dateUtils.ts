
/**
 * Utility functions for handling dates with Brasilia timezone
 */

// Format date to Brasilia timezone
export const formatDateBRT = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(dateObj);
};

// Format full date with time to Brasilia timezone
export const formatDateTimeBRT = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(dateObj);
};

// Format currency in BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

// Convert a date to Brasilia timezone
export const toBrasiliaTimezone = (date: Date | string): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const brazilTime = new Date(dateObj.toLocaleString('en-US', {timeZone: 'America/Sao_Paulo'}));
  return brazilTime;
};

// Get current date in Brasilia timezone
export const getCurrentBrasiliaDate = (): Date => {
  return toBrasiliaTimezone(new Date());
};
