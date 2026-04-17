import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { countries, currencies } from '@/data/countries';
import { Globe, Coins, Loader2, ArrowRight, Check, ChevronsUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (data: { country: string; currency: string }) => Promise<void>;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Auto-set currency when country changes
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const selectedCountry = countries.find((c) => c.code === value);
    if (selectedCountry) {
      setCurrency(selectedCountry.currency);
    }
  };

  const handleNext = () => {
    if (step === 1 && country) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!country || !currency) return;

    setIsSubmitting(true);
    try {
      await onComplete({ country, currency });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryData = countries.find((c) => c.code === country);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Welcome to TripWise! 🌍
          </DialogTitle>
          <DialogDescription>
            Let's personalize your experience. This only takes a moment.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= 1 ? 'bg-primary' : 'bg-muted'
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= 2 ? 'bg-primary' : 'bg-muted'
            }`}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Where are you based?
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Your Country</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Click to search and select
                </p>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                    >
                      {country
                        ? countries.find((c) => c.code === country)?.name
                        : "Select your country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((c) => (
                            <CommandItem
                              key={c.code}
                              value={c.name}
                              onSelect={() => {
                                handleCountryChange(c.code);
                                setCountryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country === c.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {c.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  This helps us suggest relevant currencies and destinations.
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!country}
                className="w-full"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary">
                <Coins className="h-5 w-5" />
                <span className="text-sm font-medium">
                  What currency do you use?
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Auto-filled, click to change
                </p>
                <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={currencyOpen}
                      className="w-full justify-between"
                    >
                      {currency
                        ? (() => {
                            const curr = currencies.find((c) => c.code === currency);
                            return curr ? `${curr.symbol} ${curr.code}` : currency;
                          })()
                        : "Select your currency"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search currency..." />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencies.map((c) => (
                            <CommandItem
                              key={c.code}
                              value={`${c.code} ${c.name}`}
                              onSelect={() => {
                                setCurrency(c.code);
                                setCurrencyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  currency === c.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {c.symbol} {c.code} - {c.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCountryData && (
                  <p className="text-xs text-muted-foreground">
                    Based on {selectedCountryData.name}, we've suggested{' '}
                    {selectedCountryData.currency}. Feel free to change it.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!currency || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Let's Go!"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
