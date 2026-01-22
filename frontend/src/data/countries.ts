import { Country } from '@/types';

// Countries with seasons (temperate climates)
export const countries: Country[] = [
  { code: 'US', name: 'United States', hasSeason: true, currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', hasSeason: true, currency: 'GBP' },
  { code: 'DE', name: 'Germany', hasSeason: true, currency: 'EUR' },
  { code: 'FR', name: 'France', hasSeason: true, currency: 'EUR' },
  { code: 'IT', name: 'Italy', hasSeason: true, currency: 'EUR' },
  { code: 'ES', name: 'Spain', hasSeason: true, currency: 'EUR' },
  { code: 'JP', name: 'Japan', hasSeason: true, currency: 'JPY' },
  { code: 'CA', name: 'Canada', hasSeason: true, currency: 'CAD' },
  { code: 'AU', name: 'Australia', hasSeason: true, currency: 'AUD' },
  { code: 'NZ', name: 'New Zealand', hasSeason: true, currency: 'NZD' },
  { code: 'KR', name: 'South Korea', hasSeason: true, currency: 'KRW' },
  { code: 'NL', name: 'Netherlands', hasSeason: true, currency: 'EUR' },
  { code: 'BE', name: 'Belgium', hasSeason: true, currency: 'EUR' },
  { code: 'CH', name: 'Switzerland', hasSeason: true, currency: 'CHF' },
  { code: 'AT', name: 'Austria', hasSeason: true, currency: 'EUR' },
  { code: 'SE', name: 'Sweden', hasSeason: true, currency: 'SEK' },
  { code: 'NO', name: 'Norway', hasSeason: true, currency: 'NOK' },
  { code: 'DK', name: 'Denmark', hasSeason: true, currency: 'DKK' },
  { code: 'FI', name: 'Finland', hasSeason: true, currency: 'EUR' },
  { code: 'IE', name: 'Ireland', hasSeason: true, currency: 'EUR' },
  { code: 'PT', name: 'Portugal', hasSeason: true, currency: 'EUR' },
  { code: 'GR', name: 'Greece', hasSeason: true, currency: 'EUR' },
  { code: 'PL', name: 'Poland', hasSeason: true, currency: 'PLN' },
  { code: 'CZ', name: 'Czech Republic', hasSeason: true, currency: 'CZK' },
  // Tropical countries (no traditional seasons)
  { code: 'TH', name: 'Thailand', hasSeason: false, currency: 'THB' },
  { code: 'VN', name: 'Vietnam', hasSeason: false, currency: 'VND' },
  { code: 'ID', name: 'Indonesia', hasSeason: false, currency: 'IDR' },
  { code: 'MY', name: 'Malaysia', hasSeason: false, currency: 'MYR' },
  { code: 'SG', name: 'Singapore', hasSeason: false, currency: 'SGD' },
  { code: 'PH', name: 'Philippines', hasSeason: false, currency: 'PHP' },
  { code: 'MX', name: 'Mexico', hasSeason: false, currency: 'MXN' },
  { code: 'BR', name: 'Brazil', hasSeason: false, currency: 'BRL' },
  { code: 'CO', name: 'Colombia', hasSeason: false, currency: 'COP' },
  { code: 'PE', name: 'Peru', hasSeason: false, currency: 'PEN' },
  { code: 'AR', name: 'Argentina', hasSeason: true, currency: 'ARS' },
  { code: 'CL', name: 'Chile', hasSeason: true, currency: 'CLP' },
  { code: 'EG', name: 'Egypt', hasSeason: false, currency: 'EGP' },
  { code: 'MA', name: 'Morocco', hasSeason: false, currency: 'MAD' },
  { code: 'ZA', name: 'South Africa', hasSeason: true, currency: 'ZAR' },
  { code: 'AE', name: 'United Arab Emirates', hasSeason: false, currency: 'AED' },
  { code: 'IN', name: 'India', hasSeason: false, currency: 'INR' },
  { code: 'CN', name: 'China', hasSeason: true, currency: 'CNY' },
  { code: 'TW', name: 'Taiwan', hasSeason: true, currency: 'TWD' },
  { code: 'HK', name: 'Hong Kong', hasSeason: false, currency: 'HKD' },
];

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
];

export const expenseCategories = [
  { value: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#4F46E5' },
  { value: 'transportation', label: 'Transportation', icon: '✈️', color: '#0891B2' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️', color: '#EA580C' },
  { value: 'activities', label: 'Activities', icon: '🎯', color: '#16A34A' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#DB2777' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
];

export const seasons = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return currencies.find((c) => c.code === code)?.symbol || code;
}

export function getCategoryColor(category: string): string {
  return expenseCategories.find((c) => c.value === category)?.color || '#6B7280';
}
