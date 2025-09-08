
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import ProfileSelector from './permissoes/ProfileSelector';
import UserSelector from './permissoes/UserSelector';
import PermissionTable from './permissoes/PermissionTable';
import ManageProfilesDialog from './permissoes/ManageProfilesDialog';
import ProfileDialog from './permissoes/ProfileDialog';
import { usePermissions } from './permissoes/usePermissions';
import { useProfiles } from './permissoes/useProfiles';
import { useUsers } from './permissoes/useUsers';

const PermissoesUsuario: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [manageProfilesOpen, setManageProfilesOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  const { 
    selectedPerfil,
    customProfiles,
    allProfiles,
    editingProfile,
    handlePerfilChange,
    handleSavePerfil,
    handleDeleteProfile,
    handleAddNewProfile,
    handleEditProfile
  } = useProfiles();
  
  const { 
    filteredUsers, 
    selectedUser,
    handleUserChange: handleUserSelection,
    handleUserSearch,
    isLoading: isLoadingUsers,
    allProfiles: userProfiles
  } = useUsers();
  
  const { 
    permissions, 
    isLoadingPermissions, 
    setPermissions,
    savePermissions,
    isSavingPermissions
  } = usePermissions(selectedProfileId);

  // Use selectedPerfil from useProfiles for profile selection
  useEffect(() => {
    if (selectedPerfil) {
      setSelectedProfileId(selectedPerfil);
    }
  }, [selectedPerfil]);

  // Use selectedUser from useUsers for user selection
  useEffect(() => {
    if (selectedUser) {
      setSelectedUserId(selectedUser);
    }
  }, [selectedUser]);

  const handleProfileChange = (profileId: string | null) => {
    setSelectedProfileId(profileId);
    handlePerfilChange(profileId || "");
    // Clear user selection when profile changes
    setSelectedUserId(null);
  };

  const handleUserChange = (userId: string | null) => {
    setSelectedUserId(userId);
    // Also update the selection in the useUsers hook
    if (userId) {
      handleUserSelection(userId);
    }
  };

  const handlePermissionChange = (moduleId: string, tableId: string, routineId: string, allowed: boolean) => {
    if (!permissions) return;
    
    const updatedPermissions = {...permissions};
    
    if (!updatedPermissions[moduleId]) {
      updatedPermissions[moduleId] = {};
    }
    
    if (!updatedPermissions[moduleId][tableId]) {
      updatedPermissions[moduleId][tableId] = {};
    }
    
    updatedPermissions[moduleId][tableId][routineId] = allowed;
    
    setPermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedProfileId || !permissions) return;
    
    try {
      await savePermissions(selectedProfileId, permissions);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="mr-2 text-cross-blue" size={20} />
          Gerenciamento de Permissões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ProfileSelector 
            selectedPerfil={selectedPerfil || ""}
            handlePerfilChange={(value) => handleProfileChange(value)}
            allProfiles={allProfiles}
            customProfiles={customProfiles}
            onAddNewProfile={handleAddNewProfile}
            onEditProfile={handleEditProfile}
            onDeleteProfile={handleDeleteProfile}
          />
          
          <UserSelector 
            users={filteredUsers}
            selectedUser={selectedUser}
            onUserChange={handleUserSelection}
            onSearch={handleUserSearch}
            allProfiles={userProfiles}
            isLoading={isLoadingUsers}
          />
        </div>
        
        <PermissionTable 
          permissions={permissions}
          isLoading={isLoadingPermissions}
          onPermissionChange={handlePermissionChange}
          onSave={handleSavePermissions}
          isSaving={isSavingPermissions}
          disabled={!selectedProfileId}
        />
      </CardContent>
      
      <ManageProfilesDialog 
        profiles={customProfiles} 
        onEditProfile={handleEditProfile}
        onDeleteProfile={handleDeleteProfile}
        open={manageProfilesOpen}
        onOpenChange={setManageProfilesOpen}
      />
      
      <ProfileDialog 
        onSavePerfil={handleSavePerfil}
        editingProfile={editingProfile}
        isOpen={profileDialogOpen}
        setIsOpen={setProfileDialogOpen}
      />
    </Card>
  );
};

export default PermissoesUsuario;
