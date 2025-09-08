
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Image } from 'lucide-react';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';

interface LogoUploadProps {
  empresaId: string;
  currentLogoUrl?: string;
  onLogoChange?: (logoUrl: string | null) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  empresaId, 
  currentLogoUrl, 
  onLogoChange 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, deleteLogo, isUploading, isDeleting } = useCompanyLogo();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    try {
      const logoUrl = await uploadLogo(file, empresaId);
      if (onLogoChange) {
        onLogoChange(logoUrl);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (!currentLogoUrl) return;

    const confirmDelete = window.confirm('Tem certeza que deseja remover o logo da empresa?');
    if (!confirmDelete) return;

    try {
      await deleteLogo(empresaId, currentLogoUrl);
      if (onLogoChange) {
        onLogoChange(null);
      }
    } catch (error) {
      console.error('Erro ao deletar logo:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Logo da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do logo atual */}
        {currentLogoUrl && (
          <div className="flex justify-center">
            <div className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={currentLogoUrl} 
                alt="Logo da empresa" 
                className="max-h-24 max-w-48 object-contain"
              />
            </div>
          </div>
        )}

        {/* Controles de upload */}
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            disabled={isUploading || isDeleting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {currentLogoUrl ? 'Alterar Logo' : 'Carregar Logo'}
          </Button>

          {currentLogoUrl && (
            <Button
              onClick={handleDeleteLogo}
              disabled={isUploading || isDeleting}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Informações sobre o upload */}
        <div className="text-sm text-gray-600">
          <p>• Formatos aceitos: JPEG, PNG, GIF, WebP</p>
          <p>• Tamanho máximo: 5MB</p>
          <p>• Dimensões recomendadas: 400x200px</p>
        </div>

        {/* Status de carregamento */}
        {(isUploading || isDeleting) && (
          <div className="text-center text-sm text-blue-600">
            {isUploading ? 'Carregando logo...' : 'Removendo logo...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
