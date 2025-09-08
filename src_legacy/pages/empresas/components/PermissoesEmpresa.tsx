
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/common/SearchFilter';
import { FilterConfig } from '@/components/common/SearchFilter';
import { systemModules } from './permissoes/mockData';
import ProfileDialog from './permissoes/ProfileDialog';
import ProfileSelector from './permissoes/ProfileSelector';
import PermissionTable from './permissoes/PermissionTable';
import EmpresaPermissionsHeader from './permissoes/EmpresaPermissionsHeader';
import EmpresaSelector from './permissoes/EmpresaSelector';
import { usePermissions } from './permissoes/usePermissions';
import { useProfiles } from './permissoes/useProfiles';
import { useEmpresaSearch } from './permissoes/useEmpresaSearch';

const PermissoesEmpresa: React.FC = () => {
  // Custom hooks for different functionalities
  const { 
    selectedEmpresa, 
    filteredEmpresas, 
    handleEmpresaChange,
    handleSearch,
    getEmpresaName,
    isLoading,
    error
  } = useEmpresaSearch();
  
  const {
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
  } = useProfiles();
  
  const {
    permissions,
    handlePermissionChange,
    handleSavePermissions
  } = usePermissions(selectedEmpresa, selectedPerfil);
  
  // Search filter config
  const filterConfigs: FilterConfig[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      options: allProfiles.map(profile => ({ id: profile, label: profile }))
    }
  ];

  // Format the profiles data for the manage profiles dialog
  const profilesForDialog = [
    ...allProfiles.map((p, i) => ({ id: `default-${i}`, nome: p })),
    ...customProfiles
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="mr-2 text-cross-blue" size={20} />
          Gerenciamento de Permissões por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <SearchFilter
            placeholder="Buscar por nome ou CNPJ..."
            onSearch={handleSearch}
            filters={filterConfigs}
            className="mb-4"
          />
          
          <EmpresaSelector
            selectedEmpresa={selectedEmpresa}
            handleEmpresaChange={handleEmpresaChange}
            filteredEmpresas={filteredEmpresas}
            isLoading={isLoading}
          />
          
          {error && (
            <div className="p-3 mb-3 text-sm border rounded border-red-200 bg-red-50 text-red-600">
              Erro ao carregar empresas: {error}
            </div>
          )}
        </div>

        <ProfileSelector
          selectedPerfil={selectedPerfil}
          handlePerfilChange={handlePerfilChange}
          allProfiles={allProfiles}
          customProfiles={profilesForDialog}
          onAddNewProfile={handleAddNewProfile}
          onEditProfile={handleEditProfile}
          onDeleteProfile={handleDeleteProfile}
        />

        {selectedEmpresa && (
          <>
            <EmpresaPermissionsHeader 
              empresaName={getEmpresaName(selectedEmpresa)}
              profileName={selectedPerfil}
            />

            <PermissionTable 
              systemModules={systemModules}
              permissions={permissions}
              handlePermissionChange={handlePermissionChange}
            />
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSavePermissions}
                className="bg-cross-blue hover:bg-cross-blue/90"
                disabled={!selectedEmpresa}
              >
                <Check size={16} className="mr-2" />
                Salvar Permissões
              </Button>
            </div>
          </>
        )}

        {/* Profile Dialog */}
        <ProfileDialog 
          onSavePerfil={handleSavePerfil} 
          editingProfile={editingProfile} 
          isOpen={isProfileDialogOpen}
          setIsOpen={setIsProfileDialogOpen}
        />
      </CardContent>
    </Card>
  );
};

export default PermissoesEmpresa;
