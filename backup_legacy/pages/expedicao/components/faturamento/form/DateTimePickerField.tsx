
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  className?: string;
}

const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({ 
  form, 
  name, 
  label, 
  className 
}) => {
  const dateValue = form.watch(name);
  
  const updateDateTime = (newDate?: Date, timeString?: string) => {
    if (!newDate) return;
    
    let updatedDate = new Date(newDate);
    
    // Se timeString for fornecido, atualize as horas e minutos
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        updatedDate.setHours(hours, minutes);
      }
    }
    
    form.setValue(name, updatedDate);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dateValue) {
      // Se não há data selecionada, primeiro selecione a data atual
      const today = new Date();
      updateDateTime(today, e.target.value);
    } else {
      updateDateTime(dateValue, e.target.value);
    }
  };
  
  // Formatar a hora para o formato HH:MM
  const formattedTime = dateValue ? 
    `${dateValue.getHours().toString().padStart(2, '0')}:${dateValue.getMinutes().toString().padStart(2, '0')}` : 
    '';

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => updateDateTime(date, formattedTime)}
                  disabled={(date) =>
                    date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <div className="relative">
              <Input
                type="time"
                value={formattedTime}
                onChange={handleTimeChange}
                className="w-[120px]"
              />
              <Clock className="absolute right-2 top-2.5 h-4 w-4 opacity-50" />
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateTimePickerField;
