
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onForgotPassword: () => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export const LoginForm = ({ onForgotPassword, setError, setSuccess }: LoginFormProps) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Submitting login form with email:', data.email);
      await signIn(data.email, data.password);
      console.log('Sign in completed');
      // Navigation will be handled by the auth redirects
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Exibir mensagens de erro específicas
      if (error.message.includes('Email não confirmado')) {
        setError("Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.");
      } else if (error.message.includes('Credenciais inválidas')) {
        setError("Email ou senha incorretos. Por favor, verifique e tente novamente.");
      } else {
        setError(error?.message || 'Ocorreu um erro durante o login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email', { required: "Email é obrigatório" })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          {...register('password', { required: "Senha é obrigatória" })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        <div className="text-right">
          <Button 
            variant="link" 
            className="p-0 h-auto font-normal text-sm text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
          >
            Esqueceu a senha?
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
