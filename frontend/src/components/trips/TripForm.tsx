import React, { useState, useEffect } from 'react';
import { Trip, CreateTripInput, Season } from '@/types';
import { countries, currencies, seasons, getCountryByCode } from '@/data/countries';
import { useAuth } from '@/context/AuthContext';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Loader2, Check, ChevronsUpDown, User, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

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

type CollaborationMode = 'solo' | 'separated' | 'combined';

const TRIP_TYPES: { value: CollaborationMode; icon: React.ReactNode; title: string; description: string }[] = [
  {
    value: 'solo',
    icon: <User className="h-4 w-4" />,
    title: 'Solo Trip',
    description: 'Just you, managing your own budget',
  },
  {
    value: 'combined',
    icon: <Wallet className="h-4 w-4" />,
    title: 'Trip with Friends (Combined Budget)',
    description: 'Share expenses from a common budget pool',
  },
  {
    value: 'separated',
    icon: <Users className="h-4 w-4" />,
    title: 'Trip with Friends (Separated Budget)',
    description: 'Each member tracks their own budget separately',
  },
];

export function TripForm({ open, onOpenChange, trip, onSubmit }: TripFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState<CollaborationMode>('solo');

  const [formData, setFormData] = useState<CreateTripInput>({
    name: '',
    destinationCountry: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    budgetType: 'solo',
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
        totalBudget: trip.budget,          // backend field is `budget`
        budgetType: (trip.budgetType as 'solo' | 'shared' | 'separated') || 'solo',
        season: null,                      // season not stored in backend
        favoriteCurrency: trip.currency,   // backend field is `currency`
      });
      if (trip.budgetType === 'separated') {
        setCollaborationMode('separated');
      } else if (trip.budgetType === 'shared') {
        setCollaborationMode('combined');
      } else {
        setCollaborationMode('solo');
      }
    } else {
      setFormData({
        name: '',
        destinationCountry: '',
        startDate: '',
        endDate: '',
        totalBudget: 0,
        budgetType: 'solo',
        season: null,
        favoriteCurrency: 'USD',
      });
      setCollaborationMode('solo');
    }
    setErrors({});
    setSubmitError(null);
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
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save trip. Please try again.');
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

  const handleCollaborationModeChange = (mode: CollaborationMode) => {
    setCollaborationMode(mode);
    // Auto-set budgetType based on collaboration mode
    if (mode === 'solo') {
      setFormData((prev) => ({ ...prev, budgetType: 'solo' }));
    } else if (mode === 'separated') {
      setFormData((prev) => ({ ...prev, budgetType: 'separated' }));
    } else if (mode === 'combined') {
      setFormData((prev) => ({ ...prev, budgetType: 'shared' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card max-h-[90vh] flex flex-col">
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

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="space-y-5 overflow-y-auto px-1 pr-4 max-h-[calc(90vh-180px)]">
            {/* Trip Type Selection - Card Style */}
            <div className="space-y-3 pb-5 border-b">
              <Label className="text-base font-semibold">Trip Type</Label>
              <div className="grid grid-cols-1 gap-2">
                {TRIP_TYPES.map((option) => {
                  const selected = collaborationMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleCollaborationModeChange(option.value)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/40'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {option.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-sm font-medium', selected && 'text-primary')}>
                          {option.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      {selected && (
                        <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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
            <p className="text-xs text-muted-foreground">Click to search and select</p>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className={cn(
                    "w-full justify-between",
                    errors.destinationCountry ? 'border-destructive' : ''
                  )}
                >
                  {formData.destinationCountry
                    ? countries.find((country) => country.code === formData.destinationCountry)?.name
                    : "Select a country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={() => {
                            handleCountryChange(country.code);
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.destinationCountry === country.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

          {/* Budget + inline currency */}
          <div className="space-y-2">
            <Label htmlFor="budget">
              {collaborationMode === 'solo'
                ? 'Your Budget'
                : collaborationMode === 'combined'
                ? 'Shared Budget'
                : 'Total Budget'}
            </Label>

            {/* Quick-switch pills: My currency vs Destination currency */}
            {user?.currency && formData.destinationCountry && (() => {
              const destCurrency = getCountryByCode(formData.destinationCountry)?.currency;
              if (!destCurrency || destCurrency === user.currency) return null;
              return (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, favoriteCurrency: user.currency! }))}
                    className={cn(
                      'rounded-full border px-3 py-0.5 text-xs font-medium transition-colors',
                      formData.favoriteCurrency === user.currency
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    My currency ({user.currency})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, favoriteCurrency: destCurrency }))}
                    className={cn(
                      'rounded-full border px-3 py-0.5 text-xs font-medium transition-colors',
                      formData.favoriteCurrency === destCurrency
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    Destination ({destCurrency})
                  </button>
                </div>
              );
            })()}

            {/* Budget input + currency selector side by side */}
            <div className="flex gap-2">
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
                className={cn('flex-1', errors.totalBudget ? 'border-destructive' : '')}
              />
              <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-28 shrink-0 justify-between font-mono"
                  >
                    {formData.favoriteCurrency || 'USD'}
                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {currencies.map((currency) => (
                          <CommandItem
                            key={currency.code}
                            value={`${currency.code} ${currency.name}`}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, favoriteCurrency: currency.code }));
                              setCurrencyOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.favoriteCurrency === currency.code ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {currency.symbol} {currency.code} — {currency.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {errors.totalBudget && (
              <p className="text-sm text-destructive">{errors.totalBudget}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {collaborationMode === 'solo'
                ? 'Your personal trip budget'
                : collaborationMode === 'combined'
                ? 'Pool budget shared by all members'
                : 'Can be allocated to individual members later'}
            </p>
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
          </div>

          <DialogFooter className="flex-col gap-2 pt-4 mt-4 border-t sm:flex-row sm:items-center">
            {submitError && (
              <p className="text-sm text-destructive sm:mr-auto">{submitError}</p>
            )}
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
