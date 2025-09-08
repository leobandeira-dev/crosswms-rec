
import React from 'react';
import { useLocation } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';

interface NewMainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const NewMainLayout: React.FC<NewMainLayoutProps> = ({ children, title = "Dashboard" }) => {
  const location = useLocation();
  
  // Rotas que devem exibir apenas a topbar (sem sidebar lateral)
  const shouldShowOnlyTopbar = location.pathname.includes('/armazenagem/carregamento');

  if (shouldShowOnlyTopbar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        
        <main className="container mx-auto px-4 py-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-heading text-cross-gray">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopNavbar />
        
        <main className="container mx-auto px-4 py-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-heading text-cross-gray">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default NewMainLayout;
