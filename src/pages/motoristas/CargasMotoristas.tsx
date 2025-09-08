
import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, FileText } from 'lucide-react';
import ActiveLoads from './components/ActiveLoads';
import HistoricalLoads from './components/HistoricalLoads';
import { cargas, historicoCargas } from './utils/mockData';

const CargasMotoristas = () => {
  const [activeTab, setActiveTab] = useState('ativas');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <MainLayout title="Cargas dos Motoristas">
      <div className="mb-6">
        <div>
          <h2 className="text-xl font-heading">Gestão de Cargas</h2>
          <p className="text-gray-500">Acompanhe as cargas atribuídas aos motoristas</p>
        </div>
      </div>
      
      <Tabs defaultValue="ativas" className="w-full mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="ativas" className="flex items-center">
            <Map className="mr-2 h-4 w-4" /> Cargas Ativas
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Histórico de Cargas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ativas">
          <ActiveLoads 
            cargas={cargas} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        </TabsContent>
        
        <TabsContent value="historico">
          <HistoricalLoads 
            historicoCargas={historicoCargas} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default CargasMotoristas;
