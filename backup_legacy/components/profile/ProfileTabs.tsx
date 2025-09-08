
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b px-6 py-2">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-flex">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
