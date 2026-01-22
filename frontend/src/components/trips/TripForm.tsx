import { useState, useEffect } from 'react';
import { Trip, CreateTripInput, Season } from '@/types';
import { countries, currencies, seasons, getCountryByCode } from '@/data/countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
  onSubmit: (data: CreateTripInput) => Promise<void>;
}

interface FormErrors {
  name?: string;
  destinationCountry?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: string;
}

export function TripForm({ open, onOpenChange, trip, onSubmit }: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CreateTripInput>({
    name: '',
    destinationCountry: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    season: null,
    favoriteCurrency: 'USD',
  });

  const selectedCountry = getCountryByCode(formData.destinationCountry);
  const showSeasonSelector = selectedCountry?.hasSeason ?? false;

  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name,
        destinationCountry: trip.destinationCountry,
        startDate: trip.startDate,
        endDate: trip.endDate,
        totalBudget: trip.totalBudget,
        season: trip.season,
        favoriteCurrency: trip.favoriteCurrency,
      });
    } else {
      setFormData({
        name: '',
        destinationCountry: '',
        startDate: '',
        endDate: '',
        totalBudget: 0,
        season: null,
        favoriteCurrency: 'USD',
      });
    }
    setErrors({});
  }, [trip, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.destinationCountry) {
      newErrors.destinationCountry = 'Please select a destination';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.totalBudget || formData.totalBudget <= 0) {
      newErrors.totalBudget = 'Budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryChange = (value: string) => {
    const country = getCountryByCode(value);
    setFormData((prev) => ({
      ...prev,
      destinationCountry: value,
      favoriteCurrency: country?.currency || prev.favoriteCurrency,
      season: country?.hasSeason ? prev.season : null,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {trip ? 'Edit Trip' : 'Plan a New Trip'}
          </DialogTitle>
          <DialogDescription>
            {trip
              ? 'Update your trip details below.'
              : 'Fill in the details to start planning your adventure.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              id="name"
              placeholder="Summer in Tokyo"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Destination Country</Label>
            <Select
              value={formData.destinationCountry}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger
                className={errors.destinationCountry ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] bg-popover">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destinationCountry && (
              <p className="text-sm text-destructive">{errors.destinationCountry}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className={errors.endDate ? 'border-destructive' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget</Label>
              <Input
                id="budget"
                type="number"
                min="1"
                placeholder="5000"
                value={formData.totalBudget || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalBudget: parseFloat(e.target.value) || 0,
                  }))
                }
                className={errors.totalBudget ? 'border-destructive' : ''}
              />
              {errors.totalBudget && (
                <p className="text-sm text-destructive">{errors.totalBudget}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.favoriteCurrency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, favoriteCurrency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Season Selector */}
          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            {showSeasonSelector ? (
              <Select
                value={formData.season || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    season: value as Season,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {seasons.map((season) => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.icon} {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-10 items-center px-3 rounded-md border border-input bg-muted text-muted-foreground">
                N/A - This destination doesn't have traditional seasons
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : trip ? (
                'Update Trip'
              ) : (
                'Create Trip'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add destination notes / local advice field
 * - Add map integration for destination selection
 * - Add trip sharing with other users
 * - Add trip templates for quick creation
 */
