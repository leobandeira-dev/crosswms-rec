
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface XmlViewerProps {
  xmlContent: string;
  title?: string;
}

const XmlViewer: React.FC<XmlViewerProps> = ({ xmlContent, title = 'Visualizador de XML' }) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(12);

  // Formatar o XML para exibição
  const formatXML = (xml: string): string => {
    try {
      // Limpa espaços extras
      let formatted = '';
      let indent = '';
      
      // Dividir por tags
      xml.replace(/>\s*</g, '>\n<')
         .split('\n')
         .forEach(line => {
           const matches = line.match(/^<\/(.+)>$/);
           if (matches && matches.length > 0) {
             // Fechando uma tag
             indent = indent.substring(2);
             formatted += indent + line + '\n';
           } else if (line.match(/^<.+\/>$/)) {
             // Tag auto-fechada
             formatted += indent + line + '\n';
           } else if (line.match(/^<.+>$/)) {
             // Abrindo uma tag
             formatted += indent + line + '\n';
             indent += '  ';
           } else {
             // Conteúdo da tag
             formatted += indent + line + '\n';
           }
         });
      
      return formatted;
    } catch (error) {
      console.error('Erro ao formatar XML:', error);
      return xml;
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "XML copiado para a área de transferência."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 2, 8));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" /> {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={decreaseFont}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{fontSize}px</span>
            <Button variant="outline" size="icon" onClick={increaseFont}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleCopyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative border rounded-md overflow-auto p-4 bg-muted/50 max-h-[500px]">
          <pre 
            style={{ fontSize: `${fontSize}px` }}
            className="font-mono text-sm whitespace-pre-wrap break-words"
          >{formatXML(xmlContent)}</pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default XmlViewer;
