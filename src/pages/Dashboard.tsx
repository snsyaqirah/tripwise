import { useTrips } from '@/hooks/useTrips';
import { getCurrencySymbol, expenseCategories, getCountryByCode } from '@/data/countries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  Plane,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, isFuture, isPast } from 'date-fns';

export default function Dashboard() {
  const { trips } = useTrips();

  // Calculate totals across all trips
  const totalBudget = trips.reduce((sum, t) => sum + t.totalBudget, 0);
  const totalSpent = trips.reduce((sum, t) => sum + t.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Trip stats
  const upcomingTrips = trips.filter((t) => isFuture(new Date(t.startDate)));
  const pastTrips = trips.filter((t) => isPast(new Date(t.endDate)));
  const activeTrips = trips.filter(
    (t) =>
      !isFuture(new Date(t.startDate)) && !isPast(new Date(t.endDate))
  );

  // Next upcoming trip
  const nextTrip = upcomingTrips.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )[0];

  const daysUntilNextTrip = nextTrip
    ? differenceInDays(new Date(nextTrip.startDate), new Date())
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Your travel overview at a glance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0
                  ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of total`
                  : 'No budget set'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalRemaining < 0 ? 'text-destructive' : 'text-success'
                }`}
              >
                ${totalRemaining.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to spend
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trip Status
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-2xl font-bold text-accent">
                    {upcomingTrips.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {activeTrips.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-muted-foreground">
                    {pastTrips.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Past</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Trip Card */}
      {nextTrip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-primary-foreground/70 text-sm font-medium">
                    Next Adventure
                  </p>
                  <h3 className="font-display text-2xl font-bold">
                    {nextTrip.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {getCountryByCode(nextTrip.destinationCountry)?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(nextTrip.startDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {daysUntilNextTrip !== null && (
                    <div className="text-right">
                      <span className="text-4xl font-bold">{daysUntilNextTrip}</span>
                      <p className="text-sm text-primary-foreground/70">
                        days to go
                      </p>
                    </div>
                  )}
                  <Link to={`/trips/${nextTrip.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Recent Trips</CardTitle>
            <Link to="/trips">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No trips planned yet.</p>
                <Link to="/trips" className="mt-4 inline-block">
                  <Button>Plan Your First Trip</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.slice(0, 3).map((trip) => {
                  const country = getCountryByCode(trip.destinationCountry);
                  const spentPercentage =
                    (trip.spentAmount / trip.totalBudget) * 100;

                  return (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {trip.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {country?.name} • {format(new Date(trip.startDate), 'MMM d')} -{' '}
                          {format(new Date(trip.endDate), 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {getCurrencySymbol(trip.favoriteCurrency)}
                          {trip.spentAmount.toLocaleString()}
                          <span className="text-muted-foreground font-normal">
                            {' '}
                            / {getCurrencySymbol(trip.favoriteCurrency)}
                            {trip.totalBudget.toLocaleString()}
                          </span>
                        </p>
                        <div className="w-24 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              spentPercentage >= 90
                                ? 'bg-destructive'
                                : spentPercentage >= 70
                                ? 'bg-accent'
                                : 'bg-success'
                            }`}
                            style={{
                              width: `${Math.min(spentPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Carbon Footprint Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-muted-foreground">
                🌱 Carbon Footprint Tracking
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Coming soon: Track the environmental impact of your travels
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/*
 * BONUS / UPGRADE NOTES:
 * - Charts for spending trends over time
 * - Category breakdown pie chart
 * - Currency conversion tracking
 * - Export all data as CSV/PDF
 * - Compare trips feature
 * - Travel insights and recommendations
 */
