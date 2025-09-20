
/**
 * Format currency values in Nigerian Naira - safely handles null/undefined values
 */
export const formatNaira = (amount: number | null | undefined): string => {
  const safeAmount = amount || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount);
};

/**
 * Format amount with Naira symbol - safely handles null/undefined values
 */
export const formatCurrencyNGN = (amount: number | null | undefined): string => {
  // Simple formatting with ₦ symbol, defaulting to 0 for null/undefined
  const safeAmount = amount || 0;
  return `₦${safeAmount.toLocaleString('en-NG')}`;
};

/**
 * Convert kobo to naira
 */
export const koboToNaira = (kobo: number): number => {
  return kobo / 100;
};

/**
 * Convert naira to kobo
 */
export const nairaToKobo = (naira: number): number => {
  return Math.round(naira * 100);
};
