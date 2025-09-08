
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface ImportarPorChaveProps {
  onBuscarNota: () => void;
  isLoading?: boolean;
}

const ImportarPorChave: React.FC<ImportarPorChaveProps> = ({ onBuscarNota, isLoading = false }) => {
  const { control } = useFormContext();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <FormField
              control={control}
              name="chaveNF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave de Acesso da NF-e</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a chave de acesso da nota fiscal" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button 
            type="button" 
            onClick={onBuscarNota}
            className="bg-cross-blue hover:bg-cross-blue/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              'Buscar Nota'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportarPorChave;
