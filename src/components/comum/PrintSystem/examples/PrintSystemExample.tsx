import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { UniversalPrintDialog, usePrintSystem, OrdemCargaLayout, RomaneioExpedicaoLayout } from '@/components/comum/PrintSystem';

const PrintSystemExample: React.FC = () => {
  const printSystem = usePrintSystem();

  const handleOpenPrint = () => {
    // Dados de exemplo para impressão
    const sampleData = {
      formData: {
        subtipo_operacao: 'Coleta',
        numero_ordem: 'DIR-020825225042',
        remetente_razao_social: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
        remetente_cnpj: '85179240000239',
        remetente_telefone: '4731458100',
        remetente_endereco: 'RUA GUARUJA',
        remetente_numero: '434',
        remetente_bairro: 'ITAUM',
        remetente_cidade: 'JOINVILLE',
        remetente_uf: 'SC',
        remetente_cep: '89210300',
        destinatario_razao_social: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
        destinatario_cnpj: '00655209000193',
        destinatario_telefone: '3521075167',
        destinatario_endereco: 'RODOVIA BR 135',
        destinatario_numero: 'SN',
        destinatario_bairro: 'DISTRITO INDUSTRIAL',
        destinatario_cidade: 'SAO LUIS',
        destinatario_uf: 'MA',
        destinatario_cep: '65095050'
      },
      nfesToDisplay: [
        {
          id: 'nfe-1',
          numero: '417533',
          chaveAcesso: '42250485179240000239550020004175331780623268',
          valorDeclarado: 825.00,
          peso: 11.0,
          volume: 2,
          m3: 0.5,
          remetente: {
            razaoSocial: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
            cnpj: '85179240000239',
            uf: 'SC',
            cidade: 'JOINVILLE'
          },
          destinatario: {
            razaoSocial: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
            cnpj: '00655209000193',
            uf: 'MA',
            cidade: 'SAO LUIS'
          }
        }
      ]
    };

    // Layouts disponíveis
    const printLayouts = [
      {
        id: 'ordem',
        name: 'Ordem de Carga (Tabular)',
        description: 'Layout tabular com informações detalhadas das NFEs',
        icon: '📋',
        component: OrdemCargaLayout
      },
      {
        id: 'expedicao',
        name: 'Romaneio Expedição (Códigos de Barras)',
        description: 'Layout com códigos de barras para expedição',
        icon: '📊',
        component: RomaneioExpedicaoLayout
      }
    ];

    // Abrir o sistema de impressão
    printSystem.openPrint(sampleData, printLayouts, 'ordem');
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Sistema de Impressão Universal</h3>
      <p className="text-gray-600 mb-4">
        Exemplo de como usar o sistema de impressão reutilizável com diferentes layouts.
      </p>
      
      <Button onClick={handleOpenPrint} className="bg-blue-600 hover:bg-blue-700">
        <Printer className="w-4 h-4 mr-2" />
        Abrir Sistema de Impressão
      </Button>

      {/* Sistema de impressão universal */}
      <UniversalPrintDialog
        open={printSystem.isOpen}
        onOpenChange={printSystem.closePrint}
        title="Impressão de Documentos - Exemplo"
        data={printSystem.printData}
        layouts={printSystem.layouts}
        defaultLayout={printSystem.defaultLayout}
      />
    </div>
  );
};

export default PrintSystemExample;