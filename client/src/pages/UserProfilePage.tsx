
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import { Card, CardContent } from '@/components/ui/card';

const UserProfilePage = () => {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    // Redirect if no user is logged in and loading is complete
    if (!user && !loading) {
      setLocation('/auth');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <MainLayout title="Perfil do Usuário">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

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
