
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DocumentInfo } from '../schema/documentSchema';

interface DateTimePickerFieldProps {
  form: UseFormReturn<DocumentInfo>;
  name: "departureDateTime" | "arrivalDateTime";
  label: string;
}

const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({ form, name, label }) => {
  const [selectedTime, setSelectedTime] = React.useState<string>("12:00");
  
  // Get the current date value
  const dateValue = form.watch(name);
  
  // When time changes, update the date with the new time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    setSelectedTime(timeString);
    
    if (dateValue) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const newDate = new Date(dateValue);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      form.setValue(name, newDate, { shouldValidate: true });
    }
  };
  
  // When date changes, preserve the current time
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      date.setHours(hours);
      date.setMinutes(minutes);
      form.setValue(name, date, { shouldValidate: true });
    }
  };
  
  // Initialize the time display when the component mounts or date changes
  React.useEffect(() => {
    if (dateValue) {
      const hours = dateValue.getHours().toString().padStart(2, '0');
      const minutes = dateValue.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  }, [dateValue]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
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
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <FormControl>
              <div className="relative">
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="w-[120px]"
                />
                <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              </div>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateTimePickerField;
