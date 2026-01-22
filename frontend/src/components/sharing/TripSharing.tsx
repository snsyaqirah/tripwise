import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Share2,
  Link,
  Copy,
  Check,
  Users,
  Globe,
  Lock,
  UserPlus,
  Mail,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
}

interface TripSharingProps {
  tripId: string;
  tripName: string;
  isPublic?: boolean;
  collaborators?: Collaborator[];
  onUpdateVisibility?: (isPublic: boolean) => void;
  onAddCollaborator?: (email: string, role: 'editor' | 'viewer') => void;
  onRemoveCollaborator?: (collaboratorId: string) => void;
  onUpdateCollaboratorRole?: (collaboratorId: string, role: 'editor' | 'viewer') => void;
}

export function TripSharing({
  tripId,
  tripName,
  isPublic = false,
  collaborators = [],
  onUpdateVisibility,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateCollaboratorRole,
}: TripSharingProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [publicAccess, setPublicAccess] = useState(isPublic);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [copied, setCopied] = useState(false);

  // Mock public URL
  const publicUrl = `https://tripwise.app/shared/${tripId}`;
  const collaborationUrl = `https://tripwise.app/trips/${tripId}?invite=abc123`;

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
      });
    }
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address.',
      });
      return;
    }

    if (onAddCollaborator) {
      onAddCollaborator(inviteEmail, inviteRole);
    }

    toast({
      title: 'Invitation sent!',
      description: `${inviteEmail} has been invited as ${inviteRole}.`,
    });
    setInviteEmail('');
  };

  const handleVisibilityChange = (checked: boolean) => {
    setPublicAccess(checked);
    if (onUpdateVisibility) {
      onUpdateVisibility(checked);
    }
    toast({
      title: checked ? 'Trip is now public' : 'Trip is now private',
      description: checked
        ? 'Anyone with the link can view this trip.'
        : 'Only collaborators can access this trip.',
    });
  };

  // Mock collaborators for demo
  const mockCollaborators: Collaborator[] = collaborators.length > 0 ? collaborators : [
    { id: '1', name: 'Alex Traveler', email: 'alex@example.com', role: 'owner' },
    { id: '2', name: 'Sarah Explorer', email: 'sarah@example.com', role: 'editor' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{tripName}"
          </DialogTitle>
          <DialogDescription>
            Share your trip with friends or make it public for others to discover.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Public Access Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {publicAccess ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="public-access" className="font-medium">
                    Public Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {publicAccess
                      ? 'Anyone with the link can view'
                      : 'Only collaborators can access'}
                  </p>
                </div>
              </div>
              <Switch
                id="public-access"
                checked={publicAccess}
                onCheckedChange={handleVisibilityChange}
              />
            </div>

            <AnimatePresence>
              {publicAccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyLink(publicUrl)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                or invite collaborators
              </span>
            </div>
          </div>

          {/* Invite Collaborators */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'editor' | 'viewer')}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Collaborators List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaborators ({mockCollaborators.length})
              </Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {mockCollaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {collaborator.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={collaborator.role === 'owner' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {collaborator.role}
                      </Badge>
                      {collaborator.role !== 'owner' && onRemoveCollaborator && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemoveCollaborator(collaborator.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Collaboration Link */}
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground">
              Collaboration invite link
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={collaborationUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyLink(collaborationUrl)}
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
