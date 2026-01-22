import { useMemo } from 'react';
import { Trip } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getCountryByCode } from '@/data/countries';
import { Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface TravelMapProps {
  trips: Trip[];
}

// Simple SVG world map paths for major countries
// This is a simplified representation - in production you'd use a proper map library
const countryPositions: Record<string, { x: number; y: number }> = {
  US: { x: 20, y: 40 },
  CA: { x: 18, y: 28 },
  MX: { x: 18, y: 48 },
  BR: { x: 32, y: 65 },
  AR: { x: 28, y: 78 },
  GB: { x: 47, y: 32 },
  FR: { x: 48, y: 38 },
  DE: { x: 50, y: 35 },
  IT: { x: 51, y: 42 },
  ES: { x: 45, y: 42 },
  PT: { x: 43, y: 42 },
  NL: { x: 49, y: 34 },
  BE: { x: 48, y: 35 },
  CH: { x: 50, y: 38 },
  AT: { x: 52, y: 38 },
  PL: { x: 54, y: 34 },
  CZ: { x: 52, y: 36 },
  GR: { x: 55, y: 44 },
  TR: { x: 58, y: 42 },
  RU: { x: 70, y: 30 },
  CN: { x: 78, y: 42 },
  JP: { x: 88, y: 40 },
  KR: { x: 85, y: 40 },
  IN: { x: 70, y: 50 },
  TH: { x: 77, y: 52 },
  VN: { x: 80, y: 52 },
  SG: { x: 78, y: 60 },
  MY: { x: 78, y: 58 },
  ID: { x: 82, y: 62 },
  PH: { x: 84, y: 52 },
  AU: { x: 85, y: 75 },
  NZ: { x: 92, y: 80 },
  ZA: { x: 55, y: 75 },
  EG: { x: 56, y: 48 },
  MA: { x: 44, y: 46 },
  AE: { x: 62, y: 50 },
  SA: { x: 60, y: 50 },
  IL: { x: 58, y: 46 },
};

export function TravelMap({ trips }: TravelMapProps) {
  const visitedCountries = useMemo(() => {
    const countries: Record<string, { trips: Trip[]; country: ReturnType<typeof getCountryByCode> }> = {};
    
    trips.forEach(trip => {
      if (!countries[trip.destinationCountry]) {
        countries[trip.destinationCountry] = {
          trips: [],
          country: getCountryByCode(trip.destinationCountry),
        };
      }
      countries[trip.destinationCountry].trips.push(trip);
    });
    
    return countries;
  }, [trips]);

  const visitedCount = Object.keys(visitedCountries).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Travel Map
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            {visitedCount} countries visited
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map visualization */}
        <div className="relative aspect-[2/1] bg-muted/30 rounded-xl overflow-hidden border border-border">
          {/* World map background - simplified */}
          <svg 
            viewBox="0 0 100 80" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Simple continent outlines */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--muted))" />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.1)" />
              </linearGradient>
            </defs>
            
            {/* Background */}
            <rect width="100" height="80" fill="url(#mapGradient)" opacity="0.3" />
            
            {/* Simplified continent shapes */}
            <g fill="hsl(var(--muted-foreground) / 0.15)" stroke="hsl(var(--border))" strokeWidth="0.2">
              {/* North America */}
              <ellipse cx="20" cy="35" rx="15" ry="18" />
              {/* South America */}
              <ellipse cx="30" cy="65" rx="8" ry="18" />
              {/* Europe */}
              <ellipse cx="50" cy="35" rx="10" ry="10" />
              {/* Africa */}
              <ellipse cx="52" cy="55" rx="10" ry="15" />
              {/* Asia */}
              <ellipse cx="72" cy="40" rx="18" ry="15" />
              {/* Australia */}
              <ellipse cx="85" cy="70" rx="8" ry="6" />
            </g>

            {/* Visited country markers */}
            {Object.entries(visitedCountries).map(([code, data]) => {
              const pos = countryPositions[code];
              if (!pos) return null;

              return (
                <motion.g
                  key={code}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * Object.keys(visitedCountries).indexOf(code) }}
                >
                  {/* Pulse effect */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill="hsl(var(--primary))"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values="2;4;2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Main dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="1.5"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--background))"
                    strokeWidth="0.3"
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* Country legend overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(visitedCountries).map(([code, data]) => (
                <Tooltip key={code}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                    >
                      {data.country?.name || code}
                      {data.trips.length > 1 && (
                        <span className="ml-1 opacity-70">×{data.trips.length}</span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{data.country?.name}</p>
                      {data.trips.map(trip => (
                        <p key={trip.id} className="text-xs text-muted-foreground">
                          {trip.name} • {format(new Date(trip.startDate), 'MMM yyyy')}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {trips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Your visited countries will appear here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
