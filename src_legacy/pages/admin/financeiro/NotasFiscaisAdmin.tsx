
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotasFiscaisAdmin = () => {
  useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');

  return (
    <MainLayout title="Notas Fiscais">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Notas Fiscais</h1>
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Gerencie as notas fiscais emitidas para seus clientes.
          </p>
          
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por número, cliente..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Button>
              Emitir Nova Nota
            </Button>
          </div>
        </div>

        <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="emitidas">Emitidas</TabsTrigger>
            <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Sistema de gerenciamento de notas fiscais em implementação.</p>
              <p className="mt-2">Em breve você poderá gerenciar todas as notas fiscais aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotasFiscaisAdmin;
