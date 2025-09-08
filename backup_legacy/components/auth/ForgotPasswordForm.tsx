
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

type ForgotPasswordFormData = {
  email: string;
};

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export const ForgotPasswordForm = ({ 
  onBackToLogin, 
  error, 
  success, 
  setError, 
  setSuccess 
}: ForgotPasswordFormProps) => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<ForgotPasswordFormData>();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await forgotPassword(data.email);
      setSuccess('Instruções para redefinição de senha foram enviadas para seu e-mail.');
    } catch (error: any) {
      setError(error?.message || 'Ocorreu um erro ao solicitar redefinição de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="mb-6 w-full max-w-md">
        <Button variant="link" className="p-0" onClick={onBackToLogin}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para login
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            Informe seu e-mail para receber instruções de redefinição de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-300">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email', { required: true })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
