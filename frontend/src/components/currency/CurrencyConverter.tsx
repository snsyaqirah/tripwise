import { useState, useEffect, useCallback } from 'react';
import { currencyService, CURRENCY_INFO } from '@/services/currencyService';
import { currencies } from '@/data/countries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
}

export function CurrencyConverter({ defaultFrom = 'MYR', defaultTo = 'USD' }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('100');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const convert = useCallback(async () => {
    const num = parseFloat(amount);
    if (!num || isNaN(num) || from === to) {
      setResult(from === to ? num : null);
      return;
    }
    setIsLoading(true);
    try {
      const converted = await currencyService.convertCurrency(num, from, to);
      setResult(converted);
      setRate(converted / num);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [amount, from, to]);

  useEffect(() => {
    const timer = setTimeout(convert, 400);
    return () => clearTimeout(timer);
  }, [convert]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const fromInfo = CURRENCY_INFO[from];
  const toInfo = CURRENCY_INFO[to];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 text-lg font-semibold"
              placeholder="0"
            />
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-60">
                {currencies.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {CURRENCY_INFO[c.code]?.flag ?? '🌍'} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fromInfo && (
            <p className="text-xs text-muted-foreground pl-1">
              {fromInfo.flag} {fromInfo.name}
            </p>
          )}
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={swap} className="rounded-full h-8 w-8">
            <ArrowRightLeft className="h-3 w-3" />
          </Button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-md border bg-muted/50 flex items-center min-h-10">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : result !== null ? (
                <span className="text-lg font-bold text-primary">
                  {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-60">
                {currencies.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {CURRENCY_INFO[c.code]?.flag ?? '🌍'} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {toInfo && (
            <p className="text-xs text-muted-foreground pl-1">
              {toInfo.flag} {toInfo.name}
            </p>
          )}
        </div>

        {/* Rate info */}
        {rate !== null && !isLoading && (
          <div className="text-xs text-muted-foreground pt-1 space-y-1">
            <p>1 {from} = {rate.toFixed(4)} {to}</p>
            {lastUpdated && <p className="text-xs text-muted-foreground/70">Updated {lastUpdated}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
