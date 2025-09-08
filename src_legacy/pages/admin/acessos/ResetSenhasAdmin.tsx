
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ResetSenhasTable } from '@/components/admin/acessos/ResetSenhasTable';
import { Input } from '@/components/ui/input';

const ResetSenhasAdmin = () => {
  useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Reset de Senhas</h1>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Gerencie as solicitações de reset de senha dos usuários de seus clientes.
          </p>
          
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por usuário ou cliente..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <ResetSenhasTable searchTerm={searchTerm} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ResetSenhasAdmin;
