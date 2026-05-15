import { useState, useEffect, useCallback } from 'react';
import {
  itineraryService,
  ItineraryItem,
  CreateItineraryItemRequest,
} from '@/services/itineraryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface TripItineraryProps {
  tripId: string;
  startDate: string;
  endDate: string;
}

const ITEM_CATEGORIES = [
  { value: 'transport', label: '✈️ Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'food', label: '🍽️ Food' },
  { value: 'activity', label: '🎯 Activity' },
  { value: 'sightseeing', label: '📸 Sightseeing' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'other', label: '📌 Other' },
];

const EMPTY_FORM: CreateItineraryItemRequest = {
  itemDate: '',
  title: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
};

export function TripItinerary({ tripId, startDate, endDate }: TripItineraryProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [form, setForm] = useState<CreateItineraryItemRequest>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await itineraryService.getItems(tripId);
      setItems(data);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load itinerary' });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const tripDays = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  const itemsByDate = items.reduce((acc, item) => {
    const d = item.itemDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {} as Record<string, ItineraryItem[]>);

  const openAdd = (date: string) => {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM, itemDate: date });
    setDialogOpen(true);
  };

  const openEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setForm({
      itemDate: item.itemDate,
      title: item.title,
      startTime: item.startTime ?? '',
      endTime: item.endTime ?? '',
      description: item.description ?? '',
      location: item.location ?? '',
      category: item.category ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.itemDate) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        description: form.description || undefined,
        location: form.location || undefined,
        category: form.category || undefined,
      };

      if (editingItem) {
        const updated = await itineraryService.updateItem(tripId, editingItem.id, payload);
        setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
        toast({ title: 'Updated!' });
      } else {
        const added = await itineraryService.addItem(tripId, payload);
        setItems(prev => [...prev, added]);
        toast({ title: 'Added to itinerary!' });
      }
      setDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save item' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await itineraryService.deleteItem(tripId, itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete item' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Day-by-Day Plan</h3>
          <p className="text-sm text-muted-foreground">{tripDays.length} days</p>
        </div>
        <Button size="sm" onClick={() => openAdd(startDate)}>
          <Plus className="h-4 w-4 mr-1" /> Add item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {tripDays.map((day, dayIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate[dateStr] ?? [];

            return (
              <Card key={dateStr} className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-muted/50 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center w-8">
                      <span className="text-xs text-muted-foreground">Day</span>
                      <span className="font-bold text-sm leading-none">{dayIndex + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{format(day, 'EEEE')}</p>
                      <p className="text-xs text-muted-foreground">{format(day, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openAdd(dateStr)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {dayItems.length === 0 ? (
                    <div className="py-4 px-4 text-sm text-muted-foreground text-center">
                      Nothing planned yet
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {dayItems
                        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
                        .map(item => {
                          const catInfo = ITEM_CATEGORIES.find(c => c.value === item.category);
                          return (
                            <div key={item.id} className="flex items-start gap-3 px-4 py-3 group">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{item.title}</span>
                                  {catInfo && (
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                      {catInfo.label}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                  {(item.startTime || item.endTime) && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {item.startTime && item.startTime.slice(0, 5)}
                                      {item.endTime && ` – ${item.endTime.slice(0, 5)}`}
                                    </span>
                                  )}
                                  {item.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {item.location}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingItem ? 'Edit item' : 'Add to itinerary'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  min={startDate}
                  max={endDate}
                  value={form.itemDate}
                  onChange={e => setForm(f => ({ ...f, itemDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {ITEM_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input
                placeholder="e.g. Check-in at hotel"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start time</Label>
                <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End time</Label>
                <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Input
                placeholder="e.g. KLIA, Masjid al-Haram"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Any extra details..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !form.title.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
