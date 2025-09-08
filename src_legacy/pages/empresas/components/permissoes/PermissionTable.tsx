
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ModuloEmpresa } from '../../../usuarios/components/permissoes/types';
import { PermissionsState } from './types';

interface PermissionTableProps {
  systemModules: ModuloEmpresa[];
  permissions: PermissionsState;
  handlePermissionChange: (key: string, checked: boolean) => void;
}

const PermissionTable: React.FC<PermissionTableProps> = ({ 
  systemModules, 
  permissions, 
  handlePermissionChange 
}) => {
  return (
    <div className="border rounded-md">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-2 text-left font-medium">Módulo / Aba / Rotina</th>
            <th className="px-4 py-2 text-center w-24 font-medium">Acesso</th>
          </tr>
        </thead>
        <tbody>
          {systemModules.map(module => (
            <React.Fragment key={module.id}>
              {/* Module row */}
              <tr className="bg-gray-50 hover:bg-gray-100 border-b">
                <td className="px-4 py-3 font-medium">
                  {module.nome}
                </td>
                <td className="px-4 py-3 text-center">
                  <Checkbox
                    id={`module_${module.id}`}
                    checked={permissions[`module_${module.id}`] || false}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(`module_${module.id}`, checked === true)
                    }
                  />
                </td>
              </tr>
              
              {/* Tab rows */}
              {module.tabelas.map(tab => (
                <React.Fragment key={`${module.id}_${tab.id}`}>
                  <tr className="hover:bg-gray-50 border-b">
                    <td className="px-4 py-2 pl-8">
                      {tab.nome}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Checkbox
                        id={`tab_${module.id}_${tab.id}`}
                        checked={permissions[`tab_${module.id}_${tab.id}`] || false}
                        disabled={!permissions[`module_${module.id}`]}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(`tab_${module.id}_${tab.id}`, checked === true)
                        }
                      />
                    </td>
                  </tr>
                  
                  {/* Routine rows */}
                  {tab.rotinas.map(routine => (
                    <tr key={`${module.id}_${tab.id}_${routine.id}`} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-2 pl-12 text-sm">
                        {routine.nome}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox
                          id={`routine_${module.id}_${tab.id}_${routine.id}`}
                          checked={permissions[`routine_${module.id}_${tab.id}_${routine.id}`] || false}
                          disabled={!permissions[`tab_${module.id}_${tab.id}`]}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(`routine_${module.id}_${tab.id}_${routine.id}`, checked === true)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionTable;
