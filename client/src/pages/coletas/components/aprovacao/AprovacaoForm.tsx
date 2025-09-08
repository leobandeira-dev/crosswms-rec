
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormData, formSchema } from './formSchema';
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ObservacoesField } from './fields/ObservacoesField';
import { RejeicaoFields } from './fields/RejeicaoFields';
import { AprovacaoActions } from './actions/AprovacaoActions';

interface AprovacaoFormProps {
  solicitacaoId: string;
  onApprove: (id: string, observacoes?: string) => void;
  onReject: (id: string, motivoRecusa: string, observacoes: string) => void;
}

const AprovacaoForm: React.FC<AprovacaoFormProps> = ({ 
  solicitacaoId,
  onApprove,
  onReject
}) => {
  const [isRejecting, setIsRejecting] = React.useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observacoes: '',
      motivoRecusa: '',
    },
  });
  
  const handleSubmit = (data: FormData) => {
    if (isRejecting) {
      onReject(solicitacaoId, data.motivoRecusa, data.observacoes);
    } else {
      onApprove(solicitacaoId, data.observacoes);
    }
  };

  const handleApproveClick = () => {
    const observacoes = form.getValues("observacoes");
    onApprove(solicitacaoId, observacoes);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ObservacoesField 
          form={form}
        />
        
        {isRejecting && (
          <RejeicaoFields 
            form={form}
            isRejecting={isRejecting}
          />
        )}
        
        <AprovacaoActions 
          isRejecting={isRejecting} 
          setIsRejecting={setIsRejecting}
          onClose={() => {}}
          handleApproveClick={handleApproveClick}
        />
      </form>
    </Form>
  );
};

export default AprovacaoForm;
