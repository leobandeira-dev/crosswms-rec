
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { Permission } from './types';

interface PermissionTableProps {
  permissions: Permission | null;
  isLoading: boolean;
  onPermissionChange: (moduleId: string, tableId: string, routineId: string, allowed: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  disabled: boolean;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  isLoading,
  onPermissionChange,
  onSave,
  isSaving,
  disabled
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-full max-w-md mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!permissions || Object.keys(permissions).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Nenhuma permissão encontrada</h3>
            <p className="text-gray-500 mt-2">
              Selecione um perfil para gerenciar suas permissões
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Permissões</h3>
        <Button 
          onClick={onSave} 
          disabled={disabled || isSaving}
          className="gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Módulo</TableHead>
            <TableHead>Tabela/Recurso</TableHead>
            <TableHead>Visualizar</TableHead>
            <TableHead>Editar</TableHead>
            <TableHead>Remover</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(permissions).map(([moduleId, tables]) => (
            Object.entries(tables).map(([tableId, routines]) => (
              <TableRow key={`${moduleId}-${tableId}`}>
                <TableCell className="font-medium">{moduleId}</TableCell>
                <TableCell>{tableId}</TableCell>
                <TableCell>
                  <Checkbox 
                    checked={routines.view === true} 
                    onCheckedChange={(checked) => onPermissionChange(moduleId, tableId, 'view', checked === true)}
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox 
                    checked={routines.edit === true} 
                    onCheckedChange={(checked) => onPermissionChange(moduleId, tableId, 'edit', checked === true)}
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox 
                    checked={routines.delete === true} 
                    onCheckedChange={(checked) => onPermissionChange(moduleId, tableId, 'delete', checked === true)}
                    disabled={disabled}
                  />
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionTable;
