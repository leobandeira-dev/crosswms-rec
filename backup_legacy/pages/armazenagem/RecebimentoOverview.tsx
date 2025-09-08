
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Dashboard from './Dashboard';

const RecebimentoOverview: React.FC = () => {
  return (
    <MainLayout title="Armazenagem">
      <Dashboard />
    </MainLayout>
  );
};

export default RecebimentoOverview;
