import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface VersionInfo {
  version: string;
  buildDate: string;
  commit: string;
  environment: string;
}

export const useVersionCheck = () => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  // Salvar versão inicial do app
  useEffect(() => {
    const appVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
    if (appVersion && !currentVersion) {
      setCurrentVersion(appVersion);
      localStorage.setItem('app-version', appVersion);
    }
  }, [currentVersion]);

  // Sistema de verificação de versão desabilitado para evitar notificações constantes
  // Será ativado apenas quando necessário através do sistema de controle de versões
  useEffect(() => {
    // Apenas verificar se há versão armazenada e definir estado inicial
    const storedVersion = localStorage.getItem('app-version');
    if (storedVersion) {
      setCurrentVersion(storedVersion);
    }
  }, []);

  // Forçar recarregamento em caso de erro de carregamento de módulos
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Loading chunk') || 
          event.message?.includes('Failed to fetch') ||
          event.message?.includes('dynamically imported module')) {
        console.warn('Erro de carregamento detectado, recarregando página...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return { hasUpdate, currentVersion };
};