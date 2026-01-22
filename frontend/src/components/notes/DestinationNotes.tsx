import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Lightbulb,
  MapPin,
  Utensils,
  Bus,
  AlertTriangle,
  Phone,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Globe,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DestinationNote {
  id: string;
  category: 'local_tips' | 'food' | 'transport' | 'safety' | 'emergency' | 'custom';
  title: string;
  content: string;
  createdAt: string;
}

interface DestinationNotesProps {
  tripId: string;
  destinationCountry: string;
  destinationName: string;
  notes?: DestinationNote[];
  onAddNote?: (note: Omit<DestinationNote, 'id' | 'createdAt'>) => void;
  onEditNote?: (note: DestinationNote) => void;
  onDeleteNote?: (noteId: string) => void;
}

const categoryConfig = {
  local_tips: { icon: Lightbulb, label: 'Local Tips', color: 'bg-accent' },
  food: { icon: Utensils, label: 'Food & Dining', color: 'bg-orange-500' },
  transport: { icon: Bus, label: 'Transportation', color: 'bg-blue-500' },
  safety: { icon: AlertTriangle, label: 'Safety', color: 'bg-yellow-500' },
  emergency: { icon: Phone, label: 'Emergency', color: 'bg-red-500' },
  custom: { icon: BookOpen, label: 'Custom Note', color: 'bg-primary' },
};

// Mock destination info - would come from API in production
const getDestinationInfo = (countryCode: string) => ({
  timezone: 'UTC+7',
  language: 'Thai, English',
  currency: 'Thai Baht (THB)',
  emergency: '191 (Police), 1669 (Ambulance)',
  voltage: '220V, Type A/B/C plugs',
  tipping: '10-15% at restaurants',
});

export function DestinationNotes({
  tripId,
  destinationCountry,
  destinationName,
  notes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
}: DestinationNotesProps) {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DestinationNote | null>(null);
  const [newNote, setNewNote] = useState({
    category: 'local_tips' as DestinationNote['category'],
    title: '',
    content: '',
  });

  const destInfo = getDestinationInfo(destinationCountry);

  // Mock notes for demo
  const mockNotes: DestinationNote[] = notes.length > 0 ? notes : [
    {
      id: '1',
      category: 'local_tips',
      title: 'Bargaining at markets',
      content: 'Most markets expect bargaining. Start at 50% of asking price and negotiate from there. Be friendly and respectful.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      category: 'food',
      title: 'Best street food areas',
      content: 'Check out Yaowarat (Chinatown) for authentic street food. Look for stalls with long queues - usually a good sign!',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      category: 'transport',
      title: 'Getting around',
      content: 'Use Grab app for taxis (like Uber). BTS/MRT are efficient for covering distances. Tuk-tuks are fun but negotiate price first.',
      createdAt: new Date().toISOString(),
    },
  ];

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in both title and content.',
      });
      return;
    }

    if (onAddNote) {
      onAddNote(newNote);
    }

    toast({
      title: 'Note added!',
      description: 'Your destination note has been saved.',
    });
    setNewNote({ category: 'local_tips', title: '', content: '' });
    setAddDialogOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (onDeleteNote) {
      onDeleteNote(noteId);
    }
    toast({
      title: 'Note deleted',
      description: 'The note has been removed.',
    });
  };

  const groupedNotes = mockNotes.reduce((acc, note) => {
    if (!acc[note.category]) acc[note.category] = [];
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, DestinationNote[]>);

  return (
    <div className="space-y-6">
      {/* Destination Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {destinationName} Quick Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Timezone</p>
                  <p className="text-sm text-muted-foreground">{destInfo.timezone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Languages</p>
                  <p className="text-sm text-muted-foreground">{destInfo.language}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Emergency</p>
                  <p className="text-sm text-muted-foreground">{destInfo.emergency}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Voltage</p>
                  <p className="text-sm text-muted-foreground">{destInfo.voltage}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Utensils className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Tipping</p>
                  <p className="text-sm text-muted-foreground">{destInfo.tipping}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Destination Notes
            </CardTitle>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add Destination Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant={newNote.category === key ? 'default' : 'outline'}
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => setNewNote({ ...newNote, category: key as DestinationNote['category'] })}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{config.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <Input
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                  />
                  <Button onClick={handleAddNote} className="w-full">
                    Save Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {mockNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet.</p>
                <p className="text-sm">Add tips, recommendations, and important info for your trip.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedNotes).map(([category, categoryNotes]) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  const Icon = config.icon;

                  return (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${config.color} text-white`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="font-medium">{config.label}</span>
                          <Badge variant="secondary" className="ml-2">
                            {categoryNotes.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-8">
                          {categoryNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3 rounded-lg bg-muted/50 group relative"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-sm">{note.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {note.content}
                                  </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setEditingNote(note)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/*
 * FUTURE API INTEGRATION NOTES:
 * - Integrate with destination info APIs (Triposo, Sygic, etc.)
 * - Pull weather forecasts for trip dates
 * - Show currency exchange nearby
 * - Display local events during trip
 * - Integrate maps for saved locations
 */
