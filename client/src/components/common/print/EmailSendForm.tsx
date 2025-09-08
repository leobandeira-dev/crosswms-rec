
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface EmailSendFormProps {
  email: string;
  setEmail: (value: string) => void;
  onSendEmail: () => void;
  isGenerating: boolean;
}

/**
 * Component for sending documents via email
 */
const EmailSendForm: React.FC<EmailSendFormProps> = ({
  email,
  setEmail,
  onSendEmail,
  isGenerating
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email-input">Enviar para e-mail:</Label>
      <div className="flex gap-2">
        <Input 
          id="email-input"
          type="email" 
          placeholder="exemplo@empresa.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button 
          onClick={onSendEmail}
          disabled={isGenerating || !email.trim()}
        >
          <Mail className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default EmailSendForm;
