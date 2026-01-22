import { useState, useMemo } from 'react';
import { useTrips } from '@/hooks/useTrips';
import { Trip, CreateTripInput } from '@/types';
import { TripCard } from '@/components/trips/TripCard';
import { TripForm } from '@/components/trips/TripForm';
import { TripFilters, TripFilterStatus } from '@/components/trips/TripFilters';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Compass, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { isFuture, isPast } from 'date-fns';

export default function Trips() {
  const { trips, isLoading, createTrip, updateTrip, deleteTrip } = useTrips();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TripFilterStatus>('all');

  // Categorize trips
  const categorizedTrips = useMemo(() => {
    const now = new Date();
    return {
      active: trips.filter(t => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return start <= now && end >= now;
      }),
      upcoming: trips.filter(t => isFuture(new Date(t.startDate))),
      completed: trips.filter(t => isPast(new Date(t.endDate))),
    };
  }, [trips]);

  // Filter trips based on active filter
  const filteredTrips = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return categorizedTrips.active;
      case 'upcoming':
        return categorizedTrips.upcoming;
      case 'completed':
        return categorizedTrips.completed;
      default:
        return trips;
    }
  }, [trips, activeFilter, categorizedTrips]);

  const filterCounts = {
    all: trips.length,
    active: categorizedTrips.active.length,
    upcoming: categorizedTrips.upcoming.length,
    completed: categorizedTrips.completed.length,
  };

  const handleCreateTrip = async (data: CreateTripInput) => {
    try {
      await createTrip(data);
      toast({
        title: 'Trip created!',
        description: `Your trip "${data.name}" has been added.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create trip',
        description: 'Something went wrong. Please try again.',
      });
      throw error;
    }
  };

  const handleUpdateTrip = async (data: CreateTripInput) => {
    if (!editingTrip) return;
    try {
      await updateTrip({ ...data, id: editingTrip.id });
      toast({
        title: 'Trip updated!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update trip',
        description: 'Something went wrong. Please try again.',
      });
      throw error;
    }
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip);
    setFormOpen(true);
  };

  const handleDeleteClick = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      await deleteTrip(tripToDelete);
      toast({
        title: 'Trip deleted',
        description: 'The trip has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete trip',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTrip(undefined);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Trips</h1>
          <p className="text-muted-foreground mt-1">
            Plan and manage your adventures
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTrip(undefined);
            setFormOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {/* Filters */}
      <TripFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Trip List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Compass className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">
            {activeFilter === 'all' ? 'No trips yet' : `No ${activeFilter} trips`}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {activeFilter === 'all' 
              ? 'Start planning your next adventure. Create a trip to track your budget and expenses.'
              : `You don't have any ${activeFilter} trips at the moment.`
            }
          </p>
          {activeFilter === 'all' && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Trip
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TripCard
                trip={trip}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <TripForm
        open={formOpen}
        onOpenChange={handleFormClose}
        trip={editingTrip}
        onSubmit={editingTrip ? handleUpdateTrip : handleCreateTrip}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be
              undone and will remove all associated expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
