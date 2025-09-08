
import { useState, useEffect } from 'react';
import { systemModules } from './mockData';
import { PermissionsState } from './types';
import { useToast } from '@/hooks/use-toast';

export const usePermissions = (selectedEmpresa: string, selectedPerfil: string) => {
  const [permissions, setPermissions] = useState<PermissionsState>({});
  const { toast } = useToast();

  // Initialize permissions based on company and profile selection
  useEffect(() => {
    if (selectedEmpresa && selectedPerfil) {
      const initialPermissions: PermissionsState = {};
      
      // Default all permissions to true for Transportadora
      if (selectedPerfil === "Transportadora") {
        systemModules.forEach(module => {
          initialPermissions[`module_${module.id}`] = true;
          
          module.tabelas.forEach(tab => {
            initialPermissions[`tab_${module.id}_${tab.id}`] = true;
            
            tab.rotinas.forEach(routine => {
              initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = true;
            });
          });
        });
      } 
      // For Filial, give access to most features except some administrative ones
      else if (selectedPerfil === "Filial") {
        systemModules.forEach(module => {
          initialPermissions[`module_${module.id}`] = true;
          
          module.tabelas.forEach(tab => {
            // Exclude permissions management
            if (module.id === 'empresas' && tab.id === 'cadastro') {
              initialPermissions[`tab_${module.id}_${tab.id}`] = false;
            } else {
              initialPermissions[`tab_${module.id}_${tab.id}`] = true;
            }
            
            tab.rotinas.forEach(routine => {
              if (module.id === 'empresas' && tab.id === 'cadastro') {
                initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = false;
              } else {
                initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = true;
              }
            });
          });
        });
      }
      // For clients, provide limited access
      else {
        systemModules.forEach(module => {
          if (module.id === 'coletas') {
            initialPermissions[`module_${module.id}`] = true;
            
            module.tabelas.forEach(tab => {
              if (tab.id === 'solicitacoes') {
                initialPermissions[`tab_${module.id}_${tab.id}`] = true;
                
                tab.rotinas.forEach(routine => {
                  initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = true;
                });
              } else {
                initialPermissions[`tab_${module.id}_${tab.id}`] = false;
                
                tab.rotinas.forEach(routine => {
                  initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = false;
                });
              }
            });
          } else {
            initialPermissions[`module_${module.id}`] = false;
            
            module.tabelas.forEach(tab => {
              initialPermissions[`tab_${module.id}_${tab.id}`] = false;
              
              tab.rotinas.forEach(routine => {
                initialPermissions[`routine_${module.id}_${tab.id}_${routine.id}`] = false;
              });
            });
          }
        });
      }
      
      setPermissions(initialPermissions);
    }
  }, [selectedEmpresa, selectedPerfil]);

  const handlePermissionChange = (key: string, checked: boolean) => {
    setPermissions(prev => {
      const updated = { ...prev, [key]: checked };
      
      // If it's a module or tab permission, update children accordingly
      if (key.startsWith('module_')) {
        const moduleId = key.replace('module_', '');
        const module = systemModules.find(m => m.id === moduleId);
        
        if (module) {
          module.tabelas.forEach(tab => {
            const tabKey = `tab_${moduleId}_${tab.id}`;
            updated[tabKey] = checked;
            
            tab.rotinas.forEach(routine => {
              const routineKey = `routine_${moduleId}_${tab.id}_${routine.id}`;
              updated[routineKey] = checked;
            });
          });
        }
      } else if (key.startsWith('tab_')) {
        // Extract module and tab IDs
        const [_, moduleId, tabId] = key.split('_');
        const module = systemModules.find(m => m.id === moduleId);
        
        if (module) {
          const tab = module.tabelas.find(t => t.id === tabId);
          if (tab) {
            tab.rotinas.forEach(routine => {
              const routineKey = `routine_${moduleId}_${tabId}_${routine.id}`;
              updated[routineKey] = checked;
            });
          }
        }
      }
      
      return updated;
    });
  };

  const handleSavePermissions = () => {
    // Here you would typically save the permissions to a database
    toast({
      title: "Permissões salvas",
      description: `As permissões para a empresa foram salvas com sucesso.`,
    });
  };

  return {
    permissions,
    handlePermissionChange,
    handleSavePermissions
  };
};
