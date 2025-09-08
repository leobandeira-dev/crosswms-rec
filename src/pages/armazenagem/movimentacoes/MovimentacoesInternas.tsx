
import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package, Archive, Box } from 'lucide-react';

const MovimentacoesInternas: React.FC = () => {
  return (
    <MainLayout title="Movimentações Internas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Movimentações Internas</h2>
        <p className="text-gray-600">Gerencie a movimentação interna de mercadorias no armazém</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <Link to="/armazenagem/movimentacoes/unitizacao">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 text-cross-blue" size={20} />
                Unitização de Paletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Organize e unitize volumes em paletes
              </p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <Link to="/armazenagem/movimentacoes/cancelar-unitizacao">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 text-cross-blue" size={20} />
                Cancelar Unitização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Desfaça unitizações e reorganize volumes
              </p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <Link to="/armazenagem/movimentacoes/enderecamento">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Archive className="mr-2 text-cross-blue" size={20} />
                Endereçamento de Volumes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Defina o endereçamento de volumes no armazém
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Selecione uma das opções acima para gerenciar movimentações internas.
          </p>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default MovimentacoesInternas;
