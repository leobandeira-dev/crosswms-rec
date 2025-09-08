
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OrdemCarregamento, NotaFiscal } from './types/order.types';
import OrderSearchForm from './OrderSearchForm';
import OrderDetailsCard from './OrderDetailsCard';

interface OrderDetailsFormProps {
  onSubmit: (data: any) => void;
  ordemSelecionada: OrdemCarregamento | null;
  onImportInvoices?: (notas: NotaFiscal[]) => void;
  showImportButton?: boolean;
  loading?: boolean;
}

const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({ 
  onSubmit, 
  ordemSelecionada,
  onImportInvoices,
  showImportButton = false,
  loading = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImportInvoices = () => {
    if (!ordemSelecionada || !onImportInvoices) return;
    
    setIsLoading(true);
    
    // Simulate API call to get invoices data
    setTimeout(() => {
      // Mock invoices data based on the selected order
      const mockInvoices: NotaFiscal[] = [
        {
          id: `NF-${Math.random().toString(36).substr(2, 9)}`,
          numero: `NF-${Math.floor(Math.random() * 10000)}`,
          remetente: "Empresa XYZ",
          cliente: ordemSelecionada.cliente,
          pedido: `PED-${Math.floor(Math.random() * 5000)}`,
          dataEmissao: new Date().toISOString().split('T')[0],
          valor: Math.floor(Math.random() * 10000) / 100,
          pesoBruto: Math.floor(Math.random() * 1000) / 10
        },
        {
          id: `NF-${Math.random().toString(36).substr(2, 9)}`,
          numero: `NF-${Math.floor(Math.random() * 10000)}`,
          remetente: "Empresa ABC",
          cliente: ordemSelecionada.cliente,
          pedido: `PED-${Math.floor(Math.random() * 5000)}`,
          dataEmissao: new Date().toISOString().split('T')[0],
          valor: Math.floor(Math.random() * 20000) / 100,
          pesoBruto: Math.floor(Math.random() * 1500) / 10
        }
      ];
      
      onImportInvoices(mockInvoices);
      
      toast({
        title: "Notas fiscais importadas",
        description: `${mockInvoices.length} notas fiscais foram importadas da OC ${ordemSelecionada.id}.`
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 text-cross-blue" size={20} />
          Ordem de Carregamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OrderSearchForm onSubmit={onSubmit} />
        
        {ordemSelecionada && (
          <OrderDetailsCard 
            order={ordemSelecionada}
            onImportInvoices={handleImportInvoices}
            showImportButton={showImportButton}
            loading={isLoading || loading}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsForm;

// Re-export the types to make them available to other components
export type { OrdemCarregamento, NotaFiscal } from './types/order.types';
