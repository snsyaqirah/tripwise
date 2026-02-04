import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TripMember } from '@/types';
import { MoreVertical, UserMinus, Edit } from 'lucide-react';

interface MemberListProps {
  members: TripMember[];
  currentUserId: string;
  currentUserRole: 'owner' | 'editor' | 'viewer';
  onRemoveMember: (memberId: string) => void;
  onChangeRole: (memberId: string, newRole: 'owner' | 'editor' | 'viewer') => void;
}

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onRemoveMember,
  onChangeRole,
}: MemberListProps) {
  const isOwner = currentUserRole === 'owner';

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'editor':
        return 'secondary' as const;
      case 'viewer':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.user.avatar} />
              <AvatarFallback>{member.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {member.user.name}
                {member.userId === currentUserId && (
                  <span className="text-muted-foreground text-sm ml-2">(You)</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(member.role)}>
              {member.role}
            </Badge>

            {isOwner && member.role !== 'owner' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onChangeRole(member.id, 'editor')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Change to Editor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole(member.id, 'viewer')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Change to Viewer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRemoveMember(member.id)}
                    className="text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
