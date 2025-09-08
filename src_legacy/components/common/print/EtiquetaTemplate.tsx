
import React from 'react';
import { Card } from '@/components/ui/card';
import EnhancedReadabilityLayout from './etiquetas/EnhancedReadabilityLayout';
import PortraitLayout from './etiquetas/PortraitLayout';
import EnhancedContrastLayout from './etiquetas/EnhancedContrastLayout';
import PortraitContrastLayout from './etiquetas/PortraitContrastLayout';
import TransulEnhancedLayout from './etiquetas/TransulEnhancedLayout';
import TransulContrastLayout from './etiquetas/TransulContrastLayout';
import EtiquetaMaeHeader from './etiquetas/EtiquetaMaeHeader';
import QuimicoIcon from './etiquetas/QuimicoIcon';
import { getClassificacaoText, getDisplayCidade } from './etiquetas/utils';
import { EtiquetaProps } from './etiquetas/types';

const EtiquetaTemplate = React.forwardRef<HTMLDivElement, EtiquetaProps>(
  ({ volumeData, volumeNumber, totalVolumes, format = 'small', tipo = 'volume', layoutStyle = 'enhanced', transportadoraLogo }, ref) => {
    // Define width based on format
    const isA4 = format === 'a4';
    const isPortrait = layoutStyle.includes('portrait');
    const isTransul = layoutStyle.includes('transul');
    
    let width = 'max-w-[500px]';
    let height = '';
    
    if (isA4) {
      width = 'max-w-[800px]';
    } else if (isPortrait) {
      width = 'max-w-[400px]';
      height = 'min-h-[600px]';
    } else if (isTransul) {
      width = 'max-w-[600px]';
      height = 'min-h-[400px]';
    }
    
    const isQuimico = volumeData.tipoVolume === 'quimico';
    const isMae = tipo === 'mae';
    const displayCidade = getDisplayCidade(volumeData);
    
    // Render the selected layout based on layoutStyle
    const renderLayout = () => {
      // Shared props for all layouts
      const layoutProps = {
        volumeData,
        volumeNumber,
        totalVolumes,
        isMae,
        isQuimico,
        displayCidade,
        getClassificacaoText: () => getClassificacaoText(volumeData.classificacaoQuimica),
        transportadoraLogo
      };
      
      switch (layoutStyle) {
        case 'portrait':
          return <PortraitLayout {...layoutProps} />;
        case 'portrait_contrast':
          return <PortraitContrastLayout {...layoutProps} />;
        case 'enhanced_contrast':
          return <EnhancedContrastLayout {...layoutProps} />;
        case 'transul_enhanced':
          return <TransulEnhancedLayout {...layoutProps} />;
        case 'transul_contrast':
          return <TransulContrastLayout {...layoutProps} />;
        case 'enhanced':
        default:
          return <EnhancedReadabilityLayout {...layoutProps} />;
      }
    };
    
    return (
      <div 
        ref={ref}
        className={`etiqueta-container bg-white p-4 border border-gray-300 w-full ${width} ${height}`}
        style={{ 
          pageBreakInside: 'avoid', 
          pageBreakAfter: 'always',
        }}
      >
        <Card className={`border-2 ${isMae ? 'border-red-500' : 'border-black'} p-${(layoutStyle === 'enhanced_contrast' || layoutStyle.includes('portrait') || layoutStyle.includes('transul')) ? '0' : '3'} ${(layoutStyle === 'enhanced_contrast' || layoutStyle.includes('portrait') || layoutStyle.includes('transul')) ? 'overflow-hidden' : ''} relative ${height}`}>
          {isMae && !layoutStyle.includes('contrast') && !layoutStyle.includes('portrait') && !layoutStyle.includes('transul') && (
            <EtiquetaMaeHeader 
              etiquetaMaeId={volumeData.etiquetaMae} 
              descricao={volumeData.descricao} 
            />
          )}
          
          {isQuimico && !layoutStyle.includes('contrast') && !layoutStyle.includes('portrait') && !layoutStyle.includes('transul') && <QuimicoIcon />}
          
          {renderLayout()}
        </Card>
      </div>
    );
  }
);

EtiquetaTemplate.displayName = "EtiquetaTemplate";

export default EtiquetaTemplate;
