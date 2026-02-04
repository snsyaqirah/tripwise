import { useState, useEffect } from 'react';
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
import { currencyService, CURRENCY_INFO } from '@/services/currencyService';
import { Star, ArrowRightLeft, TrendingUp, Minus, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CurrencyCardsProps {
  favoriteCurrency: string;
  tripCurrency?: string;
}

export function CurrencyCards({ favoriteCurrency, tripCurrency }: CurrencyCardsProps) {
  const [quickConvertFrom, setQuickConvertFrom] = useState(tripCurrency || 'USD');
  const [quickConvertAmount, setQuickConvertAmount] = useState('100');
  const [allCurrenciesOpen, setAllCurrenciesOpen] = useState(false);
  
  // State for real exchange rates
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const { toast } = useToast();

  // Load favorites and fetch rates
  useEffect(() => {
    loadFavorites();
    fetchExchangeRates();
  }, [favoriteCurrency]);

  const loadFavorites = () => {
    setFavorites(currencyService.getFavorites());
  };

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const data = await currencyService.getLatestRates(favoriteCurrency);
      setExchangeRates(data.rates);
      setLastUpdated(data.date);
    } catch (error) {
      toast({
        title: 'Failed to fetch exchange rates',
        description: 'Using cached data if available',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (currencyCode: string) => {
    const newFavorites = currencyService.toggleFavorite(currencyCode);
    setFavorites(newFavorites);
    
    if (newFavorites.includes(currencyCode)) {
      toast({
        title: 'Added to favorites',
        description: `${currencyCode} has been added to your favorite currencies`,
      });
    } else {
      toast({
        title: 'Removed from favorites',
        description: `${currencyCode} has been removed from favorites`,
      });
    }
  };

  const calculateConversion = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    
    // Convert to base currency first, then to target
    if (from === favoriteCurrency) {
      return amount * (exchangeRates[to] || 1);
    } else if (to === favoriteCurrency) {
      return amount / (exchangeRates[from] || 1);
    } else {
      const toBase = amount / (exchangeRates[from] || 1);
      return toBase * (exchangeRates[to] || 1);
    }
  };

  const quickConvertResult = calculateConversion(
    parseFloat(quickConvertAmount) || 0,
    quickConvertFrom,
    favoriteCurrency
  );

  const quickConvertRate = exchangeRates[quickConvertFrom] 
    ? (1 / exchangeRates[quickConvertFrom]) 
    : 1;

  // Get all currency codes sorted by favorites first
  const allCurrencyCodes = Object.keys(exchangeRates).sort((a, b) => {
    const aIsFav = favorites.includes(a);
    const bIsFav = favorites.includes(b);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return a.localeCompare(b);
  });

  const canAddMoreFavorites = favorites.length < 4;

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
              {currencyService.getCurrencyInfo(favoriteCurrency).name}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Favorite rates:</p>
                <p className="text-xs text-muted-foreground">
                  {favorites.length}/4 saved
                </p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : favorites.length > 0 ? (
                <div className="space-y-1.5">
                  {favorites.map((curr) => {
                    const rate = exchangeRates[curr];
                    const info = currencyService.getCurrencyInfo(curr);
                    return (
                      <div
                        key={curr}
                        className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{info.flag}</span>
                          <span className="text-sm font-medium">{curr}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {rate ? rate.toFixed(4) : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No favorite rates yet</p>
                  <p className="text-xs mt-1">
                    Star currencies in "All Rates"
                  </p>
                </div>
              )}
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
                  step="0.01"
                />
                <Select value={quickConvertFrom} onValueChange={setQuickConvertFrom}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CURRENCY_INFO).sort().map((code) => {
                      const info = CURRENCY_INFO[code];
                      return (
                        <SelectItem key={code} value={code}>
                          {info.flag} {code} - {info.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="px-3 text-muted-foreground text-sm">equals</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {currencyService.getCurrencyInfo(favoriteCurrency).symbol}
                      {quickConvertResult.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate: 1 {quickConvertFrom} = {quickConvertRate.toFixed(4)} {favoriteCurrency}
                    </p>
                  </>
                )}
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
                <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : Object.keys(exchangeRates).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Currencies available
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  View all rates
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
                {favorites.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {favorites.length} favorited
                  </p>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Exchange Rates (Base: {favoriteCurrency})</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {favorites.length}/4 favorites
                </span>
              </DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {allCurrencyCodes.map((currencyCode) => {
                    const rate = exchangeRates[currencyCode];
                    const info = currencyService.getCurrencyInfo(currencyCode);
                    const isFav = favorites.includes(currencyCode);
                    
                    return (
                      <div
                        key={currencyCode}
                        className={`p-3 rounded-lg border transition-all ${
                          isFav
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-background hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{info.flag}</span>
                            <span className="font-semibold">{currencyCode}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleFavorite(currencyCode)}
                            disabled={!isFav && !canAddMoreFavorites}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                isFav
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground hover:text-accent'
                              }`}
                            />
                          </Button>
                        </div>
                        <div className="text-lg font-bold">
                          {rate.toFixed(4)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {info.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Rates provided by European Central Bank
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Last updated: {lastUpdated || 'Loading...'}
                  </p>
                  {!canAddMoreFavorites && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 text-center mt-2">
                      Maximum 4 favorites reached. Remove one to add another.
                    </p>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
