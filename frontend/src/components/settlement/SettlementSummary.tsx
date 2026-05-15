import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getCurrencySymbol } from '@/data/countries';

interface Balance {
  userId: string;
  name: string;
  avatar?: string;
  paid: number;
  share: number;
  net: number;
}

interface Transaction {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

interface SettlementData {
  balances: Balance[];
  transactions: Transaction[];
  totalSpent: number;
}

interface SettlementSummaryProps {
  tripId: string;
  currency: string;
}

export function SettlementSummary({ tripId, currency }: SettlementSummaryProps) {
  const [data, setData] = useState<SettlementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<SettlementData>(`/trips/${tripId}/settlement`);
        setData(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [tripId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.balances.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Add members and expenses to see who owes whom.
        </CardContent>
      </Card>
    );
  }

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Balances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Who paid what</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total spent: {currencySymbol}{Number(data.totalSpent).toLocaleString()}
            {' '} · Equal share: {currencySymbol}{(Number(data.totalSpent) / data.balances.length).toFixed(2)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.balances.map(b => (
              <div key={b.userId} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials(b.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Paid {currencySymbol}{Number(b.paid).toLocaleString()} · Share {currencySymbol}{Number(b.share).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={b.net >= 0 ? 'default' : 'destructive'}
                  className="tabular-nums"
                >
                  {b.net >= 0 ? '+' : ''}{currencySymbol}{Math.abs(Number(b.net)).toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Settle up</CardTitle>
        </CardHeader>
        <CardContent>
          {data.transactions.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Everyone is even!
            </div>
          ) : (
            <div className="space-y-3">
              {data.transactions.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <span className="font-medium">{t.fromName}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{t.toName}</span>
                  <span className="ml-auto font-bold text-primary">
                    {currencySymbol}{Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
