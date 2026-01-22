import { useMemo, useState } from 'react';
import { Trip } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCurrencySymbol, getCountryByCode } from '@/data/countries';
import { 
  Globe, 
  Plane, 
  Wallet, 
  Calendar, 
  TrendingUp,
  MapPin,
  Share2,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface YearInReviewProps {
  trips: Trip[];
}

export function YearInReview({ trips }: YearInReviewProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    trips.forEach(trip => {
      years.add(new Date(trip.startDate).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [trips]);

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const yearTrips = useMemo(() => {
    return trips.filter(trip => 
      new Date(trip.startDate).getFullYear() === parseInt(selectedYear)
    );
  }, [trips, selectedYear]);

  const stats = useMemo(() => {
    const countries = new Set(yearTrips.map(t => t.destinationCountry));
    const totalBudget = yearTrips.reduce((sum, t) => sum + t.totalBudget, 0);
    const totalSpent = yearTrips.reduce((sum, t) => sum + t.spentAmount, 0);
    const totalDays = yearTrips.reduce((sum, t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return {
      tripCount: yearTrips.length,
      countriesVisited: countries.size,
      countries: Array.from(countries),
      totalBudget,
      totalSpent,
      totalSaved: totalBudget - totalSpent,
      totalDays,
    };
  }, [yearTrips]);

  if (availableYears.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Globe className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No Travel History Yet</h3>
          <p className="text-muted-foreground text-sm">
            Create some trips to see your year in review!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Year in Review</h2>
              <p className="text-primary-foreground/80 text-sm">Your travel adventures</p>
            </div>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Big Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-4xl font-bold">{stats.tripCount}</div>
            <div className="text-primary-foreground/70 text-sm">Trips</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-4xl font-bold">{stats.countriesVisited}</div>
            <div className="text-primary-foreground/70 text-sm">Countries</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-4xl font-bold">{stats.totalDays}</div>
            <div className="text-primary-foreground/70 text-sm">Days Traveling</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl font-bold">${stats.totalSpent.toLocaleString()}</div>
            <div className="text-primary-foreground/70 text-sm">Total Spent</div>
          </motion.div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Countries Visited */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Countries Visited</h3>
          <div className="flex flex-wrap gap-2">
            {stats.countries.map(code => {
              const country = getCountryByCode(code);
              return (
                <Badge key={code} variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <MapPin className="h-3 w-3" />
                  {country?.name || code}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Trip List for the year */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Trips in {selectedYear}</h3>
          {yearTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Plane className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{trip.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-medium">
                  {getCurrencySymbol(trip.favoriteCurrency)}{trip.spentAmount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {getCurrencySymbol(trip.favoriteCurrency)}{trip.totalBudget.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
