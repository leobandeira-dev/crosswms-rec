
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ManageProfilesDialog from './ManageProfilesDialog';
import { PerfilEmpresaCustomizado } from './types';

interface ProfileSelectorProps {
  selectedPerfil: string;
  handlePerfilChange: (value: string) => void;
  allProfiles: string[];
  customProfiles: PerfilEmpresaCustomizado[];
  onAddNewProfile: () => void;
  onEditProfile: (profile: PerfilEmpresaCustomizado) => void;
  onDeleteProfile: (id: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  selectedPerfil,
  handlePerfilChange,
  allProfiles,
  customProfiles,
  onAddNewProfile,
  onEditProfile,
  onDeleteProfile
}) => {
  return (
    <div className="mb-6 flex items-end gap-2">
      <div className="flex-grow">
        <Label htmlFor="perfil-select" className="mb-2 block">Tipo de Perfil</Label>
        <Select value={selectedPerfil} onValueChange={handlePerfilChange}>
          <SelectTrigger id="perfil-select" className="w-full">
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            {allProfiles.map(profile => (
              <SelectItem key={profile} value={profile}>
                {profile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={onAddNewProfile}>
          <Plus size={14} />
          Novo Perfil
        </Button>
        <ManageProfilesDialog 
          profiles={customProfiles}
          onEditProfile={onEditProfile}
          onDeleteProfile={onDeleteProfile}
        />
      </div>
    </div>
  );
};

export default ProfileSelector;
