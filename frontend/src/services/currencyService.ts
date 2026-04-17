import axios from 'axios';

const CURRENCY_API_BASE = 'https://api.frankfurter.dev/v2';

export interface ExchangeRates {
  date: string;
  base: string;
  rates: Record<string, number>; // { EUR: 0.92, GBP: 0.78, ... }
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar',            symbol: '$',   flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro',                  symbol: '€',   flag: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound',         symbol: '£',   flag: '🇬🇧' },
  JPY: { code: 'JPY', name: 'Japanese Yen',           symbol: '¥',   flag: '🇯🇵' },
  AUD: { code: 'AUD', name: 'Australian Dollar',      symbol: 'A$',  flag: '🇦🇺' },
  CAD: { code: 'CAD', name: 'Canadian Dollar',        symbol: 'C$',  flag: '🇨🇦' },
  CHF: { code: 'CHF', name: 'Swiss Franc',            symbol: 'Fr',  flag: '🇨🇭' },
  CNY: { code: 'CNY', name: 'Chinese Yuan',           symbol: '¥',   flag: '🇨🇳' },
  INR: { code: 'INR', name: 'Indian Rupee',           symbol: '₹',   flag: '🇮🇳' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit',      symbol: 'RM',  flag: '🇲🇾' },
  SGD: { code: 'SGD', name: 'Singapore Dollar',       symbol: 'S$',  flag: '🇸🇬' },
  THB: { code: 'THB', name: 'Thai Baht',              symbol: '฿',   flag: '🇹🇭' },
  KRW: { code: 'KRW', name: 'South Korean Won',       symbol: '₩',   flag: '🇰🇷' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar',     symbol: 'NZ$', flag: '🇳🇿' },
  SEK: { code: 'SEK', name: 'Swedish Krona',          symbol: 'kr',  flag: '🇸🇪' },
  NOK: { code: 'NOK', name: 'Norwegian Krone',        symbol: 'kr',  flag: '🇳🇴' },
  DKK: { code: 'DKK', name: 'Danish Krone',           symbol: 'kr',  flag: '🇩🇰' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar',       symbol: 'HK$', flag: '🇭🇰' },
  ZAR: { code: 'ZAR', name: 'South African Rand',     symbol: 'R',   flag: '🇿🇦' },
  MXN: { code: 'MXN', name: 'Mexican Peso',           symbol: '$',   flag: '🇲🇽' },
  BRL: { code: 'BRL', name: 'Brazilian Real',         symbol: 'R$',  flag: '🇧🇷' },
  TRY: { code: 'TRY', name: 'Turkish Lira',           symbol: '₺',   flag: '🇹🇷' },
  PLN: { code: 'PLN', name: 'Polish Zloty',           symbol: 'zł',  flag: '🇵🇱' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah',      symbol: 'Rp',  flag: '🇮🇩' },
  PHP: { code: 'PHP', name: 'Philippine Peso',        symbol: '₱',   flag: '🇵🇭' },
  CZK: { code: 'CZK', name: 'Czech Koruna',           symbol: 'Kč',  flag: '🇨🇿' },
  HUF: { code: 'HUF', name: 'Hungarian Forint',       symbol: 'Ft',  flag: '🇭🇺' },
  RON: { code: 'RON', name: 'Romanian Leu',           symbol: 'lei', flag: '🇷🇴' },
  ISK: { code: 'ISK', name: 'Icelandic Króna',        symbol: 'kr',  flag: '🇮🇸' },
  BGN: { code: 'BGN', name: 'Bulgarian Lev',          symbol: 'лв',  flag: '🇧🇬' },
};

export const currencyService = {
  /**
   * Get latest rates for a base currency.
   * v2: GET /rates?base={baseCurrency}
   * Returns array [{ date, base, quote, rate }] — we reshape into { date, base, rates: {} }
   */
  async getLatestRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const response = await axios.get<{ date: string; base: string; quote: string; rate: number }[]>(
      `${CURRENCY_API_BASE}/rates`,
      { params: { base: baseCurrency } }
    );
    const items = response.data;
    const rates: Record<string, number> = {};
    items.forEach((item) => { rates[item.quote] = item.rate; });
    return { date: items[0]?.date ?? '', base: baseCurrency, rates };
  },

  /**
   * Convert an amount from one currency to another.
   * v2: GET /rate/{from}/{to}  → { date, base, quote, rate }
   * Converted = amount * rate
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    const response = await axios.get<{ date: string; base: string; quote: string; rate: number }>(
      `${CURRENCY_API_BASE}/rate/${fromCurrency}/${toCurrency}`
    );
    return amount * response.data.rate;
  },

  /**
   * Get available currencies.
   * v2: GET /currencies → [{ iso_code, name, symbol, ... }]
   * We return Record<code, name> for backward compatibility.
   */
  async getAvailableCurrencies(): Promise<Record<string, string>> {
    const response = await axios.get<{ iso_code: string; name: string }[]>(
      `${CURRENCY_API_BASE}/currencies`
    );
    const result: Record<string, string> = {};
    response.data.forEach((c) => { result[c.iso_code] = c.name; });
    return result;
  },

  getCurrencyInfo(code: string): CurrencyInfo {
    return CURRENCY_INFO[code] ?? { code, name: code, symbol: code, flag: '🌍' };
  },

  saveFavorites(currencies: string[]): void {
    localStorage.setItem('favorite_currencies', JSON.stringify(currencies));
  },

  getFavorites(): string[] {
    const stored = localStorage.getItem('favorite_currencies');
    return stored ? JSON.parse(stored) : [];
  },

  toggleFavorite(currencyCode: string): string[] {
    let favorites = this.getFavorites();
    const index = favorites.indexOf(currencyCode);
    if (index > -1) {
      favorites = favorites.filter((c) => c !== currencyCode);
    } else if (favorites.length < 4) {
      favorites.push(currencyCode);
    }
    this.saveFavorites(favorites);
    return favorites;
  },

  isFavorite(currencyCode: string): boolean {
    return this.getFavorites().includes(currencyCode);
  },
};
