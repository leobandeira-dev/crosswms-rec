
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { NotaFiscal } from '../../Faturamento';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import BasicInfoSection from './form/BasicInfoSection';
import DocumentInfoSection from './form/DocumentInfoSection';
import ValuesSection from './form/ValuesSection';
import FreightSection from './form/FreightSection';
import AdditionalInfoSection from './form/AdditionalInfoSection';
import TaxesSection from './form/TaxesSection';
import FormActions from './form/FormActions';
import FormSection from './form/FormSection';

// Schema for form validation
const formSchema = z.object({
  data: z.date({
    required_error: "A data é obrigatória.",
  }),
  cliente: z.string().min(2, {
    message: "O cliente precisa ter pelo menos 2 caracteres.",
  }),
  remetente: z.string().optional(),
  notaFiscal: z.string().optional(),
  pedido: z.string().optional(),
  dataEmissao: z.date().optional(),
  valorNF: z.coerce.number().min(0).optional(),
  pesoNota: z.coerce.number().min(0.1, {
    message: "O peso da nota deve ser maior que 0.",
  }),
  fretePorTonelada: z.coerce.number().min(0.1, {
    message: "O frete por tonelada deve ser maior que 0.",
  }),
  pesoMinimo: z.coerce.number().min(0, {
    message: "O peso mínimo deve ser maior ou igual a 0.",
  }),
  valorFreteTransferencia: z.coerce.number().min(0).optional(),
  cteColeta: z.string().optional(),
  valorColeta: z.coerce.number().min(0).optional(),
  cteTransferencia: z.string().optional(),
  paletizacao: z.coerce.number().min(0).optional(),
  pedagio: z.coerce.number().min(0).optional(),
  aliquotaICMS: z.coerce.number().min(0).max(100, {
    message: "A alíquota de ICMS deve estar entre 0 e 100.",
  }),
  aliquotaExpresso: z.coerce.number().min(0).max(100, {
    message: "A alíquota de expresso deve estar entre 0 e 100.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculoFreteFormProps {
  onAddNotaFiscal: (nota: Omit<NotaFiscal, 'id' | 'fretePeso' | 'valorExpresso' | 'freteRatear'>) => void;
  onComplete: () => void;
}

const CalculoFreteForm: React.FC<CalculoFreteFormProps> = ({ onAddNotaFiscal, onComplete }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      cliente: '',
      remetente: '',
      notaFiscal: '',
      pedido: '',
      dataEmissao: new Date(),
      valorNF: 0,
      pesoNota: 0,
      fretePorTonelada: 0,
      pesoMinimo: 0,
      valorFreteTransferencia: 0,
      cteColeta: '',
      valorColeta: 0,
      cteTransferencia: '',
      paletizacao: 0,
      pedagio: 0,
      aliquotaICMS: 0,
      aliquotaExpresso: 0,
    },
  });

  const onSubmit = (formValues: FormValues) => {
    // Since the form is validated by zod, all values should be present and of the correct type
    const nota: Omit<NotaFiscal, 'id' | 'fretePeso' | 'valorExpresso' | 'freteRatear'> = {
      data: formValues.data,
      cliente: formValues.cliente,
      remetente: formValues.remetente,
      notaFiscal: formValues.notaFiscal,
      pedido: formValues.pedido,
      dataEmissao: formValues.dataEmissao,
      valorNF: formValues.valorNF,
      pesoNota: formValues.pesoNota,
      fretePorTonelada: formValues.fretePorTonelada,
      pesoMinimo: formValues.pesoMinimo,
      valorFreteTransferencia: formValues.valorFreteTransferencia,
      cteColeta: formValues.cteColeta,
      valorColeta: formValues.valorColeta,
      cteTransferencia: formValues.cteTransferencia,
      paletizacao: formValues.paletizacao,
      pedagio: formValues.pedagio,
      aliquotaICMS: formValues.aliquotaICMS,
      aliquotaExpresso: formValues.aliquotaExpresso,
    };
    
    onAddNotaFiscal(nota);
    form.reset({
      data: new Date(),
      cliente: '',
      remetente: '',
      notaFiscal: '',
      pedido: '',
      dataEmissao: new Date(),
      valorNF: 0,
      pesoNota: 0,
      fretePorTonelada: 0,
      pesoMinimo: 0,
      valorFreteTransferencia: 0,
      cteColeta: '',
      valorColeta: 0,
      cteTransferencia: '',
      paletizacao: 0,
      pedagio: 0,
      aliquotaICMS: 0,
      aliquotaExpresso: 0,
    });
    onComplete();
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Informações Básicas">
              <BasicInfoSection form={form} />
            </FormSection>
            
            <FormSection title="Dados do Documento">
              <DocumentInfoSection form={form} />
            </FormSection>
            
            <FormSection title="Valores">
              <ValuesSection form={form} />
            </FormSection>
            
            <FormSection title="Informações de Frete">
              <FreightSection form={form} />
            </FormSection>
            
            <FormSection title="Informações Adicionais">
              <AdditionalInfoSection form={form} />
            </FormSection>
            
            <FormSection title="Impostos e Taxas">
              <TaxesSection form={form} />
            </FormSection>

            <FormActions onReset={handleReset} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CalculoFreteForm;
