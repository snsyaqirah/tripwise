import { Button } from '@/components/ui/button';
import { Plane, Clock, CheckCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TripFilterStatus = 'all' | 'active' | 'upcoming' | 'completed';

interface TripFiltersProps {
  activeFilter: TripFilterStatus;
  onFilterChange: (filter: TripFilterStatus) => void;
  counts: {
    all: number;
    active: number;
    upcoming: number;
    completed: number;
  };
}

const filters: { value: TripFilterStatus; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Trips', icon: Calendar },
  { value: 'active', label: 'Active', icon: Plane },
  { value: 'upcoming', label: 'Upcoming', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
];

export function TripFilters({ activeFilter, onFilterChange, counts }: TripFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const count = counts[filter.value];
        const isActive = activeFilter === filter.value;

        return (
          <Button
            key={filter.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'gap-2 transition-all',
              isActive && 'shadow-md'
            )}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
