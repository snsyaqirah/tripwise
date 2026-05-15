import { useState, useEffect, useCallback } from 'react';
import { packingService, PackingItem } from '@/services/packingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Wand2 } from 'lucide-react';

interface PackingListProps {
  tripId: string;
  destinationCountry?: string;
}

const PRESET_TYPES = [
  { value: 'general', label: '🌍 General' },
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'hiking', label: '🏔️ Hiking' },
  { value: 'business', label: '💼 Business' },
  { value: 'umrah', label: '🕌 Umrah / Hajj' },
];

const CATEGORY_COLORS: Record<string, string> = {
  clothing: 'bg-blue-100 text-blue-700',
  electronics: 'bg-yellow-100 text-yellow-700',
  health: 'bg-red-100 text-red-700',
  documents: 'bg-purple-100 text-purple-700',
  gear: 'bg-green-100 text-green-700',
  personal: 'bg-pink-100 text-pink-700',
  food: 'bg-orange-100 text-orange-700',
  work: 'bg-indigo-100 text-indigo-700',
  religious: 'bg-emerald-100 text-emerald-700',
};

export function PackingList({ tripId }: PackingListProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await packingService.getItems(tripId);
      setItems(data);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load packing list' });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setIsAdding(true);
    try {
      const item = await packingService.addItem(tripId, newLabel.trim());
      setItems(prev => [...prev, item]);
      setNewLabel('');
    } catch {
      toast({ variant: 'destructive', title: 'Failed to add item' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (itemId: string) => {
    try {
      const updated = await packingService.toggleItem(tripId, itemId);
      setItems(prev => prev.map(i => i.id === itemId ? updated : i));
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update item' });
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await packingService.deleteItem(tripId, itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete item' });
    }
  };

  const handlePreset = async (type: string) => {
    setIsLoadingPreset(true);
    try {
      const added = await packingService.addPreset(tripId, type);
      setItems(prev => [...prev, ...added]);
      toast({ title: `${added.length} preset items added!` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load preset' });
    } finally {
      setIsLoadingPreset(false);
    }
  };

  const checked = items.filter(i => i.isChecked).length;
  const total = items.length;

  const grouped = items.reduce((acc, item) => {
    const key = item.category ?? 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="font-display text-lg">Packing Checklist</CardTitle>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {checked}/{total} packed
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoadingPreset}>
              {isLoadingPreset
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Wand2 className="h-4 w-4 mr-1" /> Preset</>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Add preset list</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRESET_TYPES.map(p => (
              <DropdownMenuItem key={p.value} onClick={() => handlePreset(p.value)}>
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add item input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={isAdding || !newLabel.trim()} size="sm">
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${(checked / total) * 100}%` }}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items yet.</p>
            <p className="text-sm">Add items manually or use a preset.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 capitalize">
                  {category}
                </p>
                <div className="space-y-1">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <Checkbox
                        checked={item.isChecked}
                        onCheckedChange={() => handleToggle(item.id)}
                      />
                      <span className={`flex-1 text-sm ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                        {item.label}
                      </span>
                      {item.category && (
                        <Badge
                          variant="secondary"
                          className={`text-xs hidden sm:inline-flex ${CATEGORY_COLORS[item.category] ?? ''}`}
                        >
                          {item.category}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {checked === total && total > 0 && (
          <div className="text-center py-2 text-sm text-primary font-medium">
            ✅ All packed! You're good to go.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
