import { useState } from 'react';
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
import { convertCurrency, formatCurrency } from '@/lib/currency';
import { Wallet, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripCurrencyCardProps {
  userCurrency: string;
  tripCurrency?: string;
}

export function TripCurrencyCard({ userCurrency, tripCurrency }: TripCurrencyCardProps) {
  const [convertAmount, setConvertAmount] = useState('100');
  const [convertFrom, setConvertFrom] = useState(tripCurrency || 'USD');

  const conversion = convertCurrency(
    parseFloat(convertAmount) || 0,
    convertFrom,
    userCurrency
  );

  const userCurrencyInfo = currencies.find((c) => c.code === userCurrency);

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
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <ArrowRightLeft className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">Quick Convert</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-20 h-8 text-sm"
                    min="0"
                  />
                  <Select value={convertFrom} onValueChange={setConvertFrom}>
                    <SelectTrigger className="w-24 h-8 text-sm">
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
                  <span className="text-muted-foreground">=</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(conversion.toAmount, userCurrency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
