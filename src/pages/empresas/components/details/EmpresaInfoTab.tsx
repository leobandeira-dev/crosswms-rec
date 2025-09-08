
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmpresaInfoProps {
  empresa: any;
}

const EmpresaInfoTab: React.FC<EmpresaInfoProps> = ({ empresa }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Razão Social</h4>
            <p>{empresa.razaoSocial || empresa.razao_social}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Nome Fantasia</h4>
            <p>{empresa.nomeFantasia || empresa.nome_fantasia || 'Não informado'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">CNPJ</h4>
            <p>{empresa.cnpj}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Inscrição Estadual</h4>
            <p>{empresa.inscricaoEstadual || empresa.inscricao_estadual || 'Não informado'}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Perfil da Empresa</h3>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`${empresa.perfil === 'Transportadora' ? 'bg-blue-500' : 
                              empresa.perfil === 'Filial' ? 'bg-purple-500' : 
                              empresa.perfil === 'Cliente' ? 'bg-green-500' : 'bg-amber-500'}`}>
            {empresa.perfil || 'Cliente'}
          </Badge>
          
          {(empresa.transportadoraPrincipal || empresa.transportadora_principal) && (
            <Badge className="bg-cross-blue">Transportadora Principal</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpresaInfoTab;
