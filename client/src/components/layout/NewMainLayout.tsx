
import React from 'react';
import TopNavbar from './TopNavbar';
import { HelpButton } from '@/components/help/HelpSystem';
import { useLocation } from 'wouter';

interface NewMainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const NewMainLayout: React.FC<NewMainLayoutProps> = ({ children, title = "Dashboard" }) => {
  const [location] = useLocation();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <TopNavbar />
      
      <main className="container mx-auto px-6 py-8">
        {title && (
          <div className="crosswms-page-header rounded-xl mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600">Gerencie suas operações logísticas de forma eficiente</p>
          </div>
        )}
        <div className="space-y-6">
          {children}
        </div>
      </main>
      
      {/* Contextual Help System */}
      <HelpButton contextualPage={location} />
    </div>
  );
};

export default NewMainLayout;
