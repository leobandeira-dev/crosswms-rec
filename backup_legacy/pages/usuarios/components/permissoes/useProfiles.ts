
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userProfiles } from './mockData';

export const useProfiles = () => {
  const { toast } = useToast();
  const [selectedPerfil, setSelectedPerfil] = useState<string>("");
  const [customProfiles, setCustomProfiles] = useState<Array<{ id: string, nome: string, descricao?: string }>>([]);
  const [allProfiles, setAllProfiles] = useState<string[]>(userProfiles);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ id: string, nome: string, descricao?: string } | null>(null);

  // Initialize selectedPerfil if it's empty and profiles are available
  useEffect(() => {
    if (!selectedPerfil && allProfiles.length > 0) {
      setSelectedPerfil(allProfiles[0]);
    }
  }, [selectedPerfil, allProfiles]);

  // Update all profiles when custom profiles change
  useEffect(() => {
    setAllProfiles([...userProfiles, ...customProfiles.map(p => p.nome)]);
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
  const handleEditProfile = (profile: any) => {
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
