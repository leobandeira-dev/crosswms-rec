
import React from 'react';
import { Button } from '@/components/ui/button';

interface ColetaHeaderProps {
  onWhatsAppSupport: () => void;
}

const ColetaHeader: React.FC<ColetaHeaderProps> = ({ onWhatsAppSupport }) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-heading mb-2">Recebimento de Coleta</h2>
        <p className="text-gray-600">Processe recebimentos de mercadorias provenientes de coletas</p>
      </div>
      <Button 
        onClick={onWhatsAppSupport}
        variant="outline"
        className="bg-green-500 hover:bg-green-600 text-white border-none"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mr-2 h-4 w-4"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M9 14a5 5 0 0 0 6 0" />
        </svg>
        Suporte via WhatsApp
      </Button>
    </div>
  );
};

export default ColetaHeader;
