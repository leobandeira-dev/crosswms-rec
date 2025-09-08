
import React from 'react';
import NewMainLayout from './NewMainLayout';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = "Dashboard" }) => {
  return <NewMainLayout title={title}>{children}</NewMainLayout>;
};

export default MainLayout;
