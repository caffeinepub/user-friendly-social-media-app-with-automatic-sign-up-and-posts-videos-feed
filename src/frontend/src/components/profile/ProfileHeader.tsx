import { type UserProfile } from '../../backend';
import { type Principal } from '@dfinity/principal';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { User } from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile;
  principal: Principal;
}

export default function ProfileHeader({ profile, principal }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return principal.toString().slice(0, 2).toUpperCase();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                {profile.displayName || 'Anonymous User'}
              </h1>
              {profile.handle && (
                <p className="text-sm text-muted-foreground">@{profile.handle}</p>
              )}
            </div>

            {profile.bio && <p className="text-base text-muted-foreground">{profile.bio}</p>}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {principal.toString().slice(0, 8)}...
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
