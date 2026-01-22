// Mock exchange rates (base: USD)
// In production, replace with real-time API integration

export const mockExchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  KRW: 1320.50,
  THB: 35.20,
  SGD: 1.34,
  MXN: 17.15,
  BRL: 4.97,
  MYR: 4.47,
  NZD: 1.64,
  HKD: 7.82,
  SEK: 10.42,
  NOK: 10.65,
  DKK: 6.87,
  PLN: 4.02,
  CZK: 22.85,
  PHP: 56.20,
  IDR: 15650.00,
  VND: 24350.00,
  AED: 3.67,
  ZAR: 18.55,
  TWD: 31.50,
  ARS: 365.00,
  CLP: 890.00,
  COP: 4050.00,
  PEN: 3.72,
  EGP: 30.90,
  MAD: 10.05,
};

export interface ConversionResult {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): ConversionResult {
  const fromRate = mockExchangeRates[fromCurrency] || 1;
  const toRate = mockExchangeRates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  const directRate = toRate / fromRate;

  return {
    fromAmount: amount,
    fromCurrency,
    toAmount: Number(convertedAmount.toFixed(2)),
    toCurrency,
    rate: Number(directRate.toFixed(6)),
  };
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  const fromRate = mockExchangeRates[fromCurrency] || 1;
  const toRate = mockExchangeRates[toCurrency] || 1;
  return toRate / fromRate;
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { compact?: boolean }
): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      notation: options?.compact ? 'compact' : 'standard',
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Get all available currencies for conversion
 */
export function getAvailableCurrencies(): string[] {
  return Object.keys(mockExchangeRates);
}

/*
 * FUTURE API INTEGRATION NOTES:
 * - Replace mockExchangeRates with API call to exchange rate service
 * - Consider caching rates with TTL
 * - Add rate history for trend analysis
 * - Popular APIs: Open Exchange Rates, Fixer.io, ExchangeRate-API
 */
