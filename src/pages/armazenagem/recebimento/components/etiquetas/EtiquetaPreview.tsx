
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import EnhancedPreview from './preview/EnhancedPreview';
import PortraitPreview from './preview/PortraitPreview';
import EnhancedContrastPreview from './preview/EnhancedContrastPreview';
import PortraitContrastPreview from './preview/PortraitContrastPreview';
import TransulEnhancedPreview from './preview/TransulEnhancedPreview';
import TransulContrastPreview from './preview/TransulContrastPreview';
import EtiquetaInfoList from './preview/EtiquetaInfoList';
import PrinterSelector from './preview/PrinterSelector';
import LogoUploadField from './preview/LogoUploadField';

interface EtiquetaPreviewProps {
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  formLayoutStyle?: LayoutStyle; // Receber o layout do formulário
  onLayoutChange?: (layout: LayoutStyle) => void; // Callback para sincronizar
}

const EtiquetaPreview: React.FC<EtiquetaPreviewProps> = ({ 
  tipoEtiqueta,
  isQuimico,
  formLayoutStyle,
  onLayoutChange 
}) => {
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>(formLayoutStyle || 'enhanced');
  const [transportadoraLogo, setTransportadoraLogo] = useState<string>();

  // Sincronizar com o layout do formulário
  useEffect(() => {
    if (formLayoutStyle && formLayoutStyle !== layoutStyle) {
      setLayoutStyle(formLayoutStyle);
    }
  }, [formLayoutStyle]);

  const handleLayoutChange = (newLayout: LayoutStyle) => {
    setLayoutStyle(newLayout);
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTransportadoraLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setTransportadoraLogo(undefined);
    }
  };

  const renderLayoutPreview = () => {
    const commonProps = { tipoEtiqueta, isQuimico, transportadoraLogo };

    switch (layoutStyle) {
      case 'enhanced':
        return <EnhancedPreview {...commonProps} />;
      case 'portrait':
        return <PortraitPreview {...commonProps} />;
      case 'enhanced_contrast':
        return <EnhancedContrastPreview {...commonProps} />;
      case 'portrait_contrast':
        return <PortraitContrastPreview {...commonProps} />;
      case 'transul_enhanced':
        return <TransulEnhancedPreview {...commonProps} />;
      case 'transul_contrast':
        return <TransulContrastPreview {...commonProps} />;
      default:
        return <EnhancedPreview {...commonProps} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Modelo de Etiqueta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Layout da Etiqueta</label>
          <Select value={layoutStyle} onValueChange={handleLayoutChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enhanced">Alta Legibilidade (Texto Grande)</SelectItem>
              <SelectItem value="portrait">Retrato (Itens Grandes)</SelectItem>
              <SelectItem value="enhanced_contrast">Alta Legibilidade (Alto Contraste)</SelectItem>
              <SelectItem value="alta_legibilidade_contraste">Alta Legibilidade Contraste (Texto Grande)</SelectItem>
              <SelectItem value="portrait_contrast">Retrato (Alto Contraste)</SelectItem>
              <SelectItem value="transul_enhanced">Transul Alta Legibilidade</SelectItem>
              <SelectItem value="transul_contrast">Transul Alto Contraste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <LogoUploadField 
          transportadoraLogo={transportadoraLogo}
          onLogoChange={handleLogoChange}
        />

        <div className="border rounded-md p-4 h-auto flex items-center justify-center mt-4">
          <div className="text-center">
            {renderLayoutPreview()}
          </div>
        </div>
        
        <EtiquetaInfoList tipoEtiqueta={tipoEtiqueta} isQuimico={isQuimico} />
        <PrinterSelector />
      </CardContent>
    </Card>
  );
};

export default EtiquetaPreview;
