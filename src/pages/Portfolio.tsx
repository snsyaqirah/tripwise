import { useTrips } from '@/hooks/useTrips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YearInReview } from '@/components/portfolio/YearInReview';
import { TravelTimeline } from '@/components/portfolio/TravelTimeline';
import { TravelMap } from '@/components/portfolio/TravelMap';
import { Globe, Calendar, Map, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const { trips } = useTrips();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Travel Portfolio
        </h1>
        <p className="text-muted-foreground mt-1">
          Showcase your adventures and travel memories
        </p>
      </div>

      {/* Portfolio Tabs */}
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="review" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Year in Review</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
            <span className="sm:hidden">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Travel Map</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <TabsContent value="review" className="mt-0">
            <YearInReview trips={trips} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <TravelTimeline trips={trips} />
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <TravelMap trips={trips} />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
