import { Trip } from '@/types';
import { getCountryByCode, getCurrencySymbol, seasons } from '@/data/countries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
}

export function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  const country = getCountryByCode(trip.destinationCountry);
  const currencySymbol = getCurrencySymbol(trip.favoriteCurrency);
  const spentPercentage = (trip.spentAmount / trip.totalBudget) * 100;
  const season = trip.season ? seasons.find((s) => s.value === trip.season) : null;

  const getProgressColor = () => {
    if (spentPercentage >= 90) return 'bg-destructive';
    if (spentPercentage >= 70) return 'bg-accent';
    return 'bg-success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden border-border hover:shadow-tripwise-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {trip.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{country?.name || trip.destinationCountry}</span>
                {season && (
                  <Badge variant="secondary" className="ml-2">
                    {season.icon} {season.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(trip)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(trip.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(trip.startDate), 'MMM d')} -{' '}
              {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">
                {currencySymbol}
                {trip.spentAmount.toLocaleString()} / {currencySymbol}
                {trip.totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{spentPercentage.toFixed(0)}% spent</span>
              <span>
                {currencySymbol}
                {trip.remainingBudget.toLocaleString()} remaining
              </span>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            to={`/trips/${trip.id}`}
            className="flex items-center justify-center gap-2 w-full pt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
