import axios from 'axios';

// Using Frankfurter API - Free, no API key needed, ECB data
// Docs: https://www.frankfurter.app/docs/
const CURRENCY_API_BASE = 'https://api.frankfurter.app';

export interface ExchangeRates {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Popular currencies with their info
export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  RON: { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  ISK: { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸' },
  BGN: { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
};

export const currencyService = {
  /**
   * Get latest exchange rates for a base currency
   */
  async getLatestRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    try {
      const response = await axios.get<ExchangeRates>(
        `${CURRENCY_API_BASE}/latest?from=${baseCurrency}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  },

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      const response = await axios.get<ExchangeRates>(
        `${CURRENCY_API_BASE}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      return response.data.rates[toCurrency];
    } catch (error) {
      console.error('Failed to convert currency:', error);
      throw error;
    }
  },

  /**
   * Get available currencies
   */
  async getAvailableCurrencies(): Promise<Record<string, string>> {
    try {
      const response = await axios.get<Record<string, string>>(
        `${CURRENCY_API_BASE}/currencies`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      throw error;
    }
  },

  /**
   * Get currency info with fallback
   */
  getCurrencyInfo(code: string): CurrencyInfo {
    return (
      CURRENCY_INFO[code] || {
        code,
        name: code,
        symbol: code,
        flag: '🌍',
      }
    );
  },

  /**
   * Save favorite currencies to localStorage
   */
  saveFavorites(currencies: string[]): void {
    localStorage.setItem('favorite_currencies', JSON.stringify(currencies));
  },

  /**
   * Get favorite currencies from localStorage
   */
  getFavorites(): string[] {
    const stored = localStorage.getItem('favorite_currencies');
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Toggle favorite currency (max 4)
   */
  toggleFavorite(currencyCode: string): string[] {
    let favorites = this.getFavorites();
    const index = favorites.indexOf(currencyCode);

    if (index > -1) {
      // Remove from favorites
      favorites = favorites.filter((c) => c !== currencyCode);
    } else {
      // Add to favorites (max 4)
      if (favorites.length < 4) {
        favorites.push(currencyCode);
      }
    }

    this.saveFavorites(favorites);
    return favorites;
  },

  /**
   * Check if currency is favorited
   */
  isFavorite(currencyCode: string): boolean {
    return this.getFavorites().includes(currencyCode);
  },
};
