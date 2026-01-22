import { useMemo } from 'react';
import { Trip } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCountryByCode, getCurrencySymbol } from '@/data/countries';
import { Plane, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isFuture, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

interface TravelTimelineProps {
  trips: Trip[];
}

type TripStatus = 'completed' | 'active' | 'upcoming';

function getTripStatus(trip: Trip): TripStatus {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (isPast(end)) return 'completed';
  if (isFuture(start)) return 'upcoming';
  return 'active';
}

const statusConfig: Record<TripStatus, { color: string; bgColor: string; label: string }> = {
  completed: { color: 'text-emerald-600', bgColor: 'bg-emerald-500', label: 'Completed' },
  active: { color: 'text-primary', bgColor: 'bg-primary', label: 'In Progress' },
  upcoming: { color: 'text-amber-600', bgColor: 'bg-amber-500', label: 'Upcoming' },
};

export function TravelTimeline({ trips }: TravelTimelineProps) {
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [trips]);

  // Group trips by year
  const tripsByYear = useMemo(() => {
    const groups: Record<number, Trip[]> = {};
    sortedTrips.forEach(trip => {
      const year = new Date(trip.startDate).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(trip);
    });
    return groups;
  }, [sortedTrips]);

  const years = Object.keys(tripsByYear).map(Number).sort((a, b) => b - a);

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No Trips Yet</h3>
          <p className="text-muted-foreground text-sm">
            Your travel timeline will appear here once you create trips.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Travel Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {years.map((year, yearIndex) => (
            <div key={year} className="mb-8 last:mb-0">
              {/* Year marker */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {year.toString().slice(-2)}
                </div>
                <span className="font-display text-lg font-semibold">{year}</span>
              </div>

              {/* Trips for this year */}
              <div className="ml-12 space-y-4">
                {tripsByYear[year].map((trip, tripIndex) => {
                  const status = getTripStatus(trip);
                  const config = statusConfig[status];
                  const country = getCountryByCode(trip.destinationCountry);

                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (yearIndex * 0.1) + (tripIndex * 0.05) }}
                    >
                      <Link
                        to={`/trips/${trip.id}`}
                        className="block group"
                      >
                        <div className="relative p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all">
                          {/* Timeline dot */}
                          <div 
                            className={`absolute -left-[2.75rem] top-5 h-3 w-3 rounded-full ${config.bgColor} ring-4 ring-background`} 
                          />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                  {trip.name}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={`shrink-0 text-xs ${config.color}`}
                                >
                                  {config.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {country?.name || trip.destinationCountry}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d')}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-medium">
                                {getCurrencySymbol(trip.favoriteCurrency)}{trip.spentAmount.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                / {getCurrencySymbol(trip.favoriteCurrency)}{trip.totalBudget.toLocaleString()}
                              </div>
                            </div>

                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
