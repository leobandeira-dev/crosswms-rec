
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Usuario } from '@/types/supabase.types';

interface ProfileHeaderProps {
  user: Usuario;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.nome} />
            ) : null}
            <AvatarFallback className="text-2xl">{getInitials(user.nome)}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold">{user.nome}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            {user.empresa?.nome_fantasia && (
              <p className="text-sm text-muted-foreground">
                {user.empresa.nome_fantasia}
              </p>
            )}
            {user.perfil?.nome && (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {user.perfil.nome}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
