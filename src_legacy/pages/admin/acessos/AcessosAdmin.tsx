
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

const AcessosAdmin = () => {
  useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('usuarios');

  return (
    <MainLayout title="Gestão de Acessos">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Gestão de Acessos</h1>
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos aos módulos do sistema.
          </p>
          
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por usuário, cliente..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Button>
              Novo Usuário
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            <TabsTrigger value="reset-senhas">Reset de Senhas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reset-senhas">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
              <p className="text-amber-800">
                Para gerenciar solicitações de reset de senha, acesse a{' '}
                <Link to="/admin/acessos/reset-senhas" className="font-medium text-amber-900 underline">
                  página específica de Reset de Senhas
                </Link>.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Sistema de gestão de acessos em implementação.</p>
              <p className="mt-2">Em breve você poderá gerenciar todos os acessos de usuários ao sistema aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AcessosAdmin;
