
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useXMLUpload } from '../../hooks/useXMLUpload';
import XMLFileUpload from './XMLFileUpload';
import DANFEPreviewButton from './DANFEPreviewButton';

interface ImportarViaXMLProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const ImportarViaXML: React.FC<ImportarViaXMLProps> = ({ onFileUpload, isLoading = false }) => {
  const { previewLoading, xmlContent, fileName, handleFileChange } = useXMLUpload(onFileUpload);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <XMLFileUpload 
            onFileChange={handleFileChange}
            isLoading={isLoading || previewLoading}
          />
          
          {/* Print button that appears when an XML file is loaded */}
          {xmlContent && (
            <DANFEPreviewButton
              xmlContent={xmlContent}
              fileName={fileName}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportarViaXML;
