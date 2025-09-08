import { useState, useCallback } from 'react';
import { PrintLayout } from './UniversalPrintDialog';

interface UsePrintSystemReturn {
  isOpen: boolean;
  openPrint: (data: any, layouts: PrintLayout[], defaultLayout?: string) => void;
  closePrint: () => void;
  printData: any;
  layouts: PrintLayout[];
  defaultLayout?: string;
}

export const usePrintSystem = (): UsePrintSystemReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [layouts, setLayouts] = useState<PrintLayout[]>([]);
  const [defaultLayout, setDefaultLayout] = useState<string | undefined>();

  const openPrint = useCallback((data: any, printLayouts: PrintLayout[], defaultLayoutId?: string) => {
    setPrintData(data);
    setLayouts(printLayouts);
    setDefaultLayout(defaultLayoutId);
    setIsOpen(true);
  }, []);

  const closePrint = useCallback(() => {
    setIsOpen(false);
    setPrintData(null);
    setLayouts([]);
    setDefaultLayout(undefined);
  }, []);

  return {
    isOpen,
    openPrint,
    closePrint,
    printData,
    layouts,
    defaultLayout,
  };
};