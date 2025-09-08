
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCompanyLogo = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uploadLogo = async (file: File, empresaId: string) => {
    setIsUploading(true);
    try {
      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${empresaId}_${timestamp}.${fileExtension}`;

      console.log('📤 Iniciando upload do logo:', fileName);

      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload realizado:', uploadData);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;
      console.log('🔗 URL pública do logo:', logoUrl);

      // Atualizar a empresa com a URL do logo
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ logo_url: logoUrl })
        .eq('id', empresaId);

      if (updateError) {
        console.error('❌ Erro ao atualizar empresa:', updateError);
        throw updateError;
      }

      console.log('✅ Empresa atualizada com novo logo');

      toast({
        title: "✅ Logo Carregado",
        description: "O logo da empresa foi carregado com sucesso.",
      });

      return logoUrl;
    } catch (error) {
      console.error('💥 Erro no processo de upload:', error);
      toast({
        title: "❌ Erro no Upload",
        description: error instanceof Error ? error.message : "Não foi possível carregar o logo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteLogo = async (empresaId: string, logoUrl?: string) => {
    setIsDeleting(true);
    try {
      console.log('🗑️ Iniciando remoção do logo para empresa:', empresaId);

      // Se há uma URL de logo, tentar deletar o arquivo do storage
      if (logoUrl) {
        const fileName = logoUrl.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from('company-logos')
            .remove([fileName]);

          if (deleteError) {
            console.warn('⚠️ Aviso ao deletar arquivo:', deleteError);
            // Não interromper o processo se o arquivo não existir mais
          }
        }
      }

      // Remover a URL do logo da empresa
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ logo_url: null })
        .eq('id', empresaId);

      if (updateError) {
        console.error('❌ Erro ao atualizar empresa:', updateError);
        throw updateError;
      }

      console.log('✅ Logo removido da empresa');

      toast({
        title: "✅ Logo Removido",
        description: "O logo da empresa foi removido com sucesso.",
      });

    } catch (error) {
      console.error('💥 Erro ao remover logo:', error);
      toast({
        title: "❌ Erro na Remoção",
        description: error instanceof Error ? error.message : "Não foi possível remover o logo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    uploadLogo,
    deleteLogo,
    isUploading,
    isDeleting
  };
};
