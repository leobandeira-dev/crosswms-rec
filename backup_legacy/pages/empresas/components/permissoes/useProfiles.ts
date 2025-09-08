
import { useState, useEffect } from 'react';
import { profiles } from './mockData';
import { PerfilEmpresaCustomizado } from './types';
import { useToast } from '@/hooks/use-toast';

export const useProfiles = () => {
  const [selectedPerfil, setSelectedPerfil] = useState<string>("Transportadora");
  const [customProfiles, setCustomProfiles] = useState<PerfilEmpresaCustomizado[]>([]);
  const [allProfiles, setAllProfiles] = useState<string[]>(profiles);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PerfilEmpresaCustomizado | null>(null);
  const { toast } = useToast();
  
  // Update all profiles when custom profiles change
  useEffect(() => {
    setAllProfiles([...profiles, ...customProfiles.map(p => p.nome)]);
  }, [customProfiles]);

  const handlePerfilChange = (value: string) => {
    setSelectedPerfil(value);
  };

  // Handle adding or editing a profile
  const handleSavePerfil = (nome: string, descricao: string, id?: string) => {
    if (id) {
      // Edit existing profile
      setCustomProfiles(prev => prev.map(p => 
        p.id === id ? { ...p, nome, descricao } : p
      ));
      toast({
        title: "Perfil atualizado",
        description: `O perfil "${nome}" foi atualizado com sucesso.`,
      });
    } else {
      // Add new profile
      const newId = `custom-${Date.now()}`;
      setCustomProfiles(prev => [...prev, { id: newId, nome, descricao }]);
      toast({
        title: "Perfil adicionado",
        description: `O perfil "${nome}" foi adicionado com sucesso.`,
      });
    }
  };

  // Handle deleting a profile
  const handleDeleteProfile = (id: string) => {
    setCustomProfiles(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Perfil excluído",
      description: `O perfil foi excluído com sucesso.`,
    });
  };

  // Open dialog to add new profile
  const handleAddNewProfile = () => {
    setEditingProfile(null);
    setIsProfileDialogOpen(true);
  };

  // Open dialog to edit profile
  const handleEditProfile = (profile: PerfilEmpresaCustomizado) => {
    setEditingProfile(profile);
    setIsProfileDialogOpen(true);
  };

  return {
    selectedPerfil,
    customProfiles,
    allProfiles,
    isProfileDialogOpen,
    setIsProfileDialogOpen,
    editingProfile,
    handlePerfilChange,
    handleSavePerfil,
    handleDeleteProfile,
    handleAddNewProfile,
    handleEditProfile
  };
};
