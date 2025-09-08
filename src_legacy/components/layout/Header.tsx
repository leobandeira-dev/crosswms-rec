
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNotifications } from './UserNotifications';
import { UserProfileMenu } from './UserProfileMenu';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-heading text-cross-gray">{title}</h1>
      
      <div className="flex items-center gap-2">
        <div className="relative mr-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="search" 
            placeholder="Buscar..." 
            className="pl-10 w-[200px] lg:w-[300px] rounded-full"
          />
        </div>
        
        <UserNotifications />
        <UserProfileMenu />
      </div>
    </header>
  );
};

export default Header;
