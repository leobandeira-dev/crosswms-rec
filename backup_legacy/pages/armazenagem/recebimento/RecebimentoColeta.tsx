
import React, { useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { recebimentoColetaFilterConfig } from './filterConfig';
import ColetaHeader from './components/ColetaHeader';
import ColetaContent from './components/ColetaContent';
import { recebimentosColetaMock } from './mockData';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const RecebimentoColeta: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('pendentes');
  
  const handleAcceptColeta = (coletaId: string) => {
    // Implementar lógica para aceitar coleta
    toast({
      title: "Coleta aceita com sucesso",
      description: `A coleta ${coletaId} foi aceita e está em processamento.`,
    });
    console.log('Coleta aceita:', coletaId);
  };

  const handleWhatsAppSupport = () => {
    // Número fictício para suporte via WhatsApp
    const phoneNumber = "5511912345678";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=Olá,%20preciso%20de%20suporte%20com%20uma%20coleta.`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <MainLayout title="Recebimento de Coleta">
      <ColetaHeader onWhatsAppSupport={handleWhatsAppSupport} />
      
      <div className="mb-4">
        <Link to="/armazenagem/recebimento/rastreamento">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Rastreamento de Notas Fiscais
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="pendentes" className="mb-6" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pendentes">Coletas Pendentes</TabsTrigger>
          <TabsTrigger value="processadas">Coletas Processadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendentes">
          <ColetaContent
            selectedTab="pendentes"
            filterConfig={recebimentoColetaFilterConfig}
            recebimentosColeta={recebimentosColetaMock}
            onAcceptColeta={handleAcceptColeta}
          />
        </TabsContent>
        
        <TabsContent value="processadas">
          <ColetaContent
            selectedTab="processadas"
            filterConfig={recebimentoColetaFilterConfig}
            recebimentosColeta={recebimentosColetaMock}
            onAcceptColeta={handleAcceptColeta}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default RecebimentoColeta;
