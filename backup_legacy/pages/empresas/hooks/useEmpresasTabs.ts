
import { useState, useEffect } from 'react';

export type EmpresaTab = 'cadastro' | 'permissoes' | 'listagem';

interface UseEmpresasTabsProps {
  initialTab?: EmpresaTab;
}

export const useEmpresasTabs = ({ initialTab = 'cadastro' }: UseEmpresasTabsProps) => {
  const [currentTab, setCurrentTab] = useState<EmpresaTab>(initialTab);
  
  // Update tab when initialTab changes (useful for navigation via link)
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  return {
    currentTab,
    setCurrentTab
  };
};
