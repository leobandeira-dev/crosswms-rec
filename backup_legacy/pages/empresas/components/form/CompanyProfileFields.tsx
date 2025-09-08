
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from 'react-hook-form';

interface ProfileOption {
  value: string;
  label: string;
}

interface CompanyProfileFieldsProps {
  form: UseFormReturn<any>;
  perfisList: ProfileOption[];
}

const CompanyProfileFields: React.FC<CompanyProfileFieldsProps> = ({ form, perfisList }) => {
  return (
    <>
      <div>
        <h3 className="font-medium mb-2">Perfil da Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perfisList.map((perfilOption) => (
            <FormField
              key={perfilOption.value}
              control={form.control}
              name="perfil"
              render={({ field }) => {
                return (
                  <FormItem
                    key={perfilOption.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value === perfilOption.value}
                        onCheckedChange={() => {
                          form.setValue('perfil', perfilOption.value);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {perfilOption.label}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
        </div>
        {/* Fix: Convert the form error to a string if it exists */}
        <FormMessage>
          {form.formState.errors.perfil ? String(form.formState.errors.perfil.message) : null}
        </FormMessage>
      </div>

      <FormField
        control={form.control}
        name="transportadoraPrincipal"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Transportadora Principal
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default CompanyProfileFields;
