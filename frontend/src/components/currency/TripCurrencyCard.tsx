import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { currencies } from '@/data/countries';
import { currencyService } from '@/services/currencyService';
import { Wallet, ArrowRightLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripCurrencyCardProps {
  userCurrency: string;
  tripCurrency?: string;
}

export function TripCurrencyCard({ userCurrency, tripCurrency }: TripCurrencyCardProps) {
  const [convertAmount, setConvertAmount] = useState('100');
  const [convertFrom, setConvertFrom] = useState(tripCurrency || 'USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const userCurrencyInfo = currencies.find((c) => c.code === userCurrency);

  useEffect(() => {
    const fetchConversion = async () => {
      const amount = parseFloat(convertAmount);
      if (!amount || amount <= 0 || convertFrom === userCurrency) {
        setConvertedAmount(amount);
        return;
      }

      setIsConverting(true);
      try {
        const result = await currencyService.convertCurrency(
          amount,
          convertFrom,
          userCurrency
        );
        setConvertedAmount(result);
      } catch (error) {
        console.error('Currency conversion failed:', error);
        setConvertedAmount(null);
      } finally {
        setIsConverting(false);
      }
    };

    fetchConversion();
  }, [convertAmount, convertFrom, userCurrency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Your Currency */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Currency</p>
                <p className="text-xl font-bold">{userCurrency}</p>
                <p className="text-xs text-muted-foreground">{userCurrencyInfo?.name}</p>
              </div>
            </div>

            {/* Quick Convert */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <ArrowRightLeft className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Quick Price Converter</p>
                  <p className="text-xs text-muted-foreground">Convert local prices to your budget</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-24 h-9 text-sm"
                    min="0"
                    placeholder="Amount"
                  />
                  <Select value={convertFrom} onValueChange={setConvertFrom}>
                    <SelectTrigger className="w-24 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">=</span>
                  {isConverting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <div className="font-semibold text-lg text-primary">
                      {userCurrency} {convertedAmount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
