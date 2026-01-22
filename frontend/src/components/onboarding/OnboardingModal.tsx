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
import { countries, currencies } from '@/data/countries';
import { Globe, Coins, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (data: { country: string; currency: string }) => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onComplete({ country, currency });
    setIsSubmitting(false);
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
                <Select value={country} onValueChange={handleCountryChange}>
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue placeholder="Select your currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
