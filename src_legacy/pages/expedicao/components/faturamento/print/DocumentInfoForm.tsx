
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { documentSchema, DocumentInfo } from './schema/documentSchema';
import DocumentBasicInfoSection from './form-sections/DocumentBasicInfoSection';
import DriverInfoSection from './form-sections/DriverInfoSection';
import OperationInfoSection from './form-sections/OperationInfoSection';
import { generateDocumentNumber } from '../../../utils/documentUtils';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentInfoFormProps {
  onSubmit: (data: DocumentInfo) => void;
  onCancel: () => void;
  defaultSequence?: number;
}

const DocumentInfoForm: React.FC<DocumentInfoFormProps> = ({ 
  onSubmit, 
  onCancel,
  defaultSequence = 1
}) => {
  const form = useForm<DocumentInfo>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentNumber: generateDocumentNumber(new Date(), defaultSequence),
      documentType: "outbound",
      departureDateTime: new Date(),
      arrivalDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 dia
      driverName: "",
      truckId: "",
      trailer1: "",
      trailer2: "",
      trailerType: "",
      issuerUser: "Usuário Atual",
      checkerUser: "",
      transporterName: "",
      transporterLogo: "",
    },
  });

  const handleFormSubmit = (data: DocumentInfo) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="pt-6">
          <DocumentBasicInfoSection form={form} />
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="pt-6">
          <DriverInfoSection form={form} />
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="pt-6">
          <OperationInfoSection form={form} />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Gerar documento
        </Button>
      </div>
    </form>
  );
};

export default DocumentInfoForm;
