
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Map, MapPin } from 'lucide-react';
import { useEnderecamentoCadastro } from './hooks/useEnderecamentoCadastro';
import FiliaisTab from './components/FiliaisTab';
import EnderecosCompletosTab from './components/EnderecosCompletosTab';

const CadastroEnderecamento: React.FC = () => {
  const enderecamento = useEnderecamentoCadastro();
  
  return (
    <MainLayout title="Cadastro de Endereçamento">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Cadastro de Endereçamento</h2>
        <p className="text-gray-600">Gerencie a hierarquia de endereçamento do armazém</p>
      </div>
      
      <Tabs defaultValue="enderecos" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="enderecos">
            <MapPin className="mr-2" size={16} />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="filiais">
            <Building className="mr-2" size={16} />
            Filiais
          </TabsTrigger>
          <TabsTrigger value="areas">
            <Map className="mr-2" size={16} />
            Áreas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="enderecos">
          <EnderecosCompletosTab enderecos={enderecamento.enderecosCompletos} />
        </TabsContent>
        
        <TabsContent value="filiais">
          <FiliaisTab 
            filiais={enderecamento.filiais}
            adicionarFilial={enderecamento.adicionarFilial}
            atualizarFilial={enderecamento.atualizarFilial}
            excluirFilial={enderecamento.excluirFilial}
            currentFilial={enderecamento.currentFilial}
            setCurrentFilial={enderecamento.setCurrentFilial}
          />
        </TabsContent>
        
        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <CardTitle>Áreas e Sub-hierarquias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Este módulo permite o cadastro da hierarquia completa de endereçamento, seguindo o fluxo:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Hierarquia de Endereçamento:</p>
                <div className="flex items-center mt-2 overflow-x-auto">
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Filial</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Área</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Rota</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Rua</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Prédio</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Bloco</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Andar</div>
                    <div className="mx-2">→</div>
                  </div>
                  <div className="flex items-center min-w-fit">
                    <div className="px-3 py-2 bg-cross-blue text-white rounded-md">Apartamento</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default CadastroEnderecamento;
