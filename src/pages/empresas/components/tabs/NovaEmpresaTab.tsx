
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import EmpresaForm from '../EmpresaForm';

const NovaEmpresaTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Building className="mr-2 text-cross-blue" size={20} />
          Cadastro de Nova Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmpresaForm />
      </CardContent>
    </Card>
  );
};

export default NovaEmpresaTab;
