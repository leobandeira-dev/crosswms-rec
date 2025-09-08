
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import { Card, CardContent } from '@/components/ui/card';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user data since authentication is removed
  const user = {
    id: '1',
    email: 'usuario@sistema.com',
    nome: 'Usuário Sistema',
    telefone: '(11) 99999-9999',
    avatar_url: null,
    empresa_id: '1',
    perfil_id: '1',
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    funcao: 'administrador'
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainLayout title="Perfil do Usuário">
      <div className="space-y-6">
        <ProfileHeader user={user} />
        
        <Card>
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          <CardContent className="pt-6">
            {activeTab === 'profile' && (
              <ProfileForm user={user} />
            )}
            {activeTab === 'security' && (
              <PasswordChangeForm />
            )}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Notificações</h3>
                <p>Configure quais notificações você deseja receber do sistema.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
