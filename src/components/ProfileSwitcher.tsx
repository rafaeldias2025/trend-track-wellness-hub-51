import { useState } from 'react';
import { User, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const profiles = [
  { id: 1, name: 'João Silva', initials: 'JS', active: true },
  { id: 2, name: 'Maria Silva', initials: 'MS', active: false },
  { id: 3, name: 'Pedro Costa', initials: 'PC', active: false },
];

export const ProfileSwitcher = () => {
  const [activeProfile, setActiveProfile] = useState(profiles[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-10">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {activeProfile.initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{activeProfile.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {profiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => setActiveProfile(profile)}
            className={`flex items-center gap-2 ${
              profile.active ? 'bg-muted' : ''
            }`}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <span>{profile.name}</span>
            {profile.active && (
              <div className="ml-auto h-2 w-2 bg-success-green rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2 text-primary">
          <Plus className="h-4 w-4" />
          <span>Adicionar Perfil</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};