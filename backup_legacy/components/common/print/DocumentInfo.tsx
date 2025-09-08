
import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentInfoProps {
  documentType: string;
  documentId: string;
  status?: 'approved' | 'rejected' | 'pending';
}

/**
 * Component to display document information
 */
const DocumentInfo: React.FC<DocumentInfoProps> = ({
  documentType,
  documentId,
  status
}) => {
  const getBgColor = () => {
    if (status === 'approved') return 'bg-green-50 border-green-200';
    if (status === 'rejected') return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };
  
  const getTextColor = () => {
    if (status === 'approved') return 'text-green-700';
    if (status === 'rejected') return 'text-red-700';
    return 'text-blue-700';
  };
  
  const getIconColor = () => {
    if (status === 'approved') return 'text-green-500';
    if (status === 'rejected') return 'text-red-500';
    return 'text-blue-500';
  };
  
  const getStatusText = () => {
    if (status === 'approved') return ' (APROVADO)';
    if (status === 'rejected') return ' (RECUSADO)';
    return '';
  };

  return (
    <div className={`flex items-center gap-2 p-4 ${getBgColor()} rounded-md`}>
      <FileText className={`h-5 w-5 ${getIconColor()}`} />
      <p className={`text-sm ${getTextColor()}`}>
        Este documento ({documentType} - {documentId}{getStatusText()}) será gerado em formato PDF.
      </p>
    </div>
  );
};

export default DocumentInfo;
