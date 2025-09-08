
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useAuth } from '@/hooks/useAuth';

interface LogoUploadFieldProps {
  transportadoraLogo?: string;
  onLogoChange: (file: File | null) => void;
}

const LogoUploadField: React.FC<LogoUploadFieldProps> = ({ transportadoraLogo, onLogoChange }) => {
  const { user } = useAuth();
  const { logoUrl: empresaLogo } = useEmpresaLogo(user?.empresa_id);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLogoChange(file);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Logo da Empresa (se disponível) */}
      {empresaLogo && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building size={16} />
            Logo da Empresa
          </Label>
          <div className="p-2 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
              <Building size={14} />
              Logo configurado nas configurações da empresa
            </div>
            <div className="flex justify-center">
              <img 
                src={empresaLogo} 
                alt="Logo da Empresa" 
                className="max-h-12 object-contain border rounded"
              />
            </div>
            <div className="text-xs text-blue-600 mt-1 text-center">
              Este logo será usado automaticamente nas etiquetas
            </div>
          </div>
        </div>
      )}

      {/* Upload de Logo da Transportadora */}
      <div className="space-y-2">
        <Label htmlFor="transportadora-logo">Logo da Transportadora (90x25mm)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="transportadora-logo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
          {transportadoraLogo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              className="gap-1"
            >
              <X size={14} />
              Remover
            </Button>
          )}
        </div>
        {transportadoraLogo && (
          <div className="mt-2 p-2 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Upload size={14} />
              Logo carregada com sucesso
            </div>
            <div className="mt-1">
              <img 
                src={transportadoraLogo} 
                alt="Preview Logo" 
                className="max-h-16 object-contain border rounded"
              />
            </div>
          </div>
        )}
        <div className="text-xs text-gray-500">
          Dimensões recomendadas: 90mm x 25mm. Formatos suportados: JPG, PNG, GIF
        </div>
      </div>
    </div>
  );
};

export default LogoUploadField;
