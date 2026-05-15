import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TripActivity {
  id: string;
  tripId: string;
  userId?: string;
  actorName: string;
  actionType: string;
  description: string;
  createdAt: string;
}

interface ActivityFeedProps {
  tripId: string;
}

const ACTION_ICONS: Record<string, string> = {
  expense_added: '💸',
  expense_deleted: '🗑️',
  member_joined: '👋',
  trip_updated: '✏️',
};

export function ActivityFeed({ tripId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<TripActivity[]>(`/trips/${tripId}/activity`);
        setActivities(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [tripId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity yet.</p>
            <p className="text-sm">Activity will appear here as the trip is updated.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex gap-3 py-3 ${index < activities.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-base">
                  {ACTION_ICONS[activity.actionType] ?? '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
