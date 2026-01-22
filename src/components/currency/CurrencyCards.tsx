import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { currencies } from '@/data/countries';
import { convertCurrency, mockExchangeRates, formatCurrency } from '@/lib/currency';
import { Star, Plus, ArrowRightLeft, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CurrencyCardsProps {
  favoriteCurrency: string;
  tripCurrency?: string;
}

export function CurrencyCards({ favoriteCurrency, tripCurrency }: CurrencyCardsProps) {
  const [quickConvertFrom, setQuickConvertFrom] = useState(tripCurrency || 'USD');
  const [quickConvertAmount, setQuickConvertAmount] = useState('100');
  const [allCurrenciesOpen, setAllCurrenciesOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);

  const conversion = convertCurrency(
    parseFloat(quickConvertAmount) || 0,
    quickConvertFrom,
    favoriteCurrency
  );

  // Popular currencies to show
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'THB'];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Favorite Currency Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Currency
            </CardTitle>
            <Star className="h-4 w-4 text-accent fill-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteCurrency}</div>
            <p className="text-sm text-muted-foreground">
              {currencies.find((c) => c.code === favoriteCurrency)?.name}
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">Quick rates:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {popularCurrencies
                  .filter((c) => c !== favoriteCurrency)
                  .slice(0, 4)
                  .map((curr) => {
                    const rate = convertCurrency(1, curr, favoriteCurrency);
                    return (
                      <div key={curr} className="flex justify-between">
                        <span className="text-muted-foreground">{curr}</span>
                        <span className="font-medium">
                          {rate.toAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Converter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Convert
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={quickConvertAmount}
                  onChange={(e) => setQuickConvertAmount(e.target.value)}
                  className="w-24"
                  min="0"
                />
                <Select value={quickConvertFrom} onValueChange={setQuickConvertFrom}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="px-3 text-muted-foreground text-sm">equals</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(conversion.toAmount, favoriteCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate: 1 {quickConvertFrom} = {conversion.rate.toFixed(4)} {favoriteCurrency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View All Currencies Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Dialog open={allCurrenciesOpen} onOpenChange={setAllCurrenciesOpen}>
          <DialogTrigger asChild>
            <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  All Rates
                </CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(mockExchangeRates).length}</div>
                <p className="text-sm text-muted-foreground">
                  Currencies available
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  View all rates
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle>Exchange Rates (Base: {favoriteCurrency})</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {Object.keys(mockExchangeRates)
                .filter((code) => code !== favoriteCurrency)
                .sort()
                .map((currencyCode) => {
                  const conversion = convertCurrency(1, favoriteCurrency, currencyCode);
                  const currInfo = currencies.find((c) => c.code === currencyCode);
                  // Mock trend (random for demo)
                  const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
                  
                  return (
                    <div
                      key={currencyCode}
                      className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{currencyCode}</span>
                        {trend === 'up' && (
                          <TrendingUp className="h-3 w-3 text-success" />
                        )}
                        {trend === 'down' && (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        {trend === 'stable' && (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        {conversion.toAmount.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {currInfo?.name || currencyCode}
                      </p>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Rates are for reference only. Last updated: Mock data
            </p>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
