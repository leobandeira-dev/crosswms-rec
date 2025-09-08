
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { reportExport } from '@/utils/reportExport';

interface ExportActionsProps {
  title: string;
  fileName: string;
  contentRef: React.RefObject<HTMLElement>;
  data?: any[];
}

const ExportActions: React.FC<ExportActionsProps> = ({
  title,
  fileName,
  contentRef,
  data
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (isExporting || !contentRef.current) return;
    
    setIsExporting(true);
    try {
      await reportExport.toPDF({
        title,
        fileName,
        element: contentRef.current
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (isExporting || !data) return;
    
    setIsExporting(true);
    try {
      reportExport.toExcel({
        title,
        fileName,
        data
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (isExporting || !contentRef.current) return;
    
    setIsExporting(true);
    try {
      reportExport.print({
        title,
        fileName,
        element: contentRef.current
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar como PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar como Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={handlePrint} disabled={isExporting}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
    </div>
  );
};

export default ExportActions;
