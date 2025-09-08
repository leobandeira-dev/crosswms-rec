
import React from 'react';

interface EtiquetaInfoListProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
}

const EtiquetaInfoList: React.FC<EtiquetaInfoListProps> = ({ tipoEtiqueta, isQuimico }) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Informações na Etiqueta</h3>
      <ul className="text-sm space-y-1">
        {tipoEtiqueta === 'mae' ? (
          <>
            <li>• ID único da etiqueta mãe</li>
            <li>• QR Code de identificação</li>
            <li>• Número da nota fiscal</li>
            <li>• Quantidade total de volumes</li>
            <li>• Remetente / Destinatário</li>
            <li>• Cidade completa / UF</li>
            <li>• Peso total dos volumes</li>
            <li>• Transportadora</li>
          </>
        ) : (
          <>
            <li>• ID único do volume com QR Code</li>
            <li>• Número da nota fiscal</li>
            <li>• Numeração sequencial (X/Y)</li>
            <li>• Remetente / Destinatário</li>
            <li>• Cidade completa / UF</li>
            <li>• Tipo de volume (Geral / Químico)</li>
            <li>• Peso total dos volumes</li>
            <li>• Transportadora</li>
            {isQuimico && (
              <>
                <li>• Código ONU</li>
                <li>• Código de Risco</li>
                <li>• Simbologia de Perigo</li>
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default EtiquetaInfoList;
