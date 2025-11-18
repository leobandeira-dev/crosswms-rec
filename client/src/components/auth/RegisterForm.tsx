
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

type RegisterFormData = {
  nome: string;
  email: string;
  telefone?: string;
  cnpj?: string;
  password: string;
  tipo_usuario: 'transportador' | 'cliente' | 'fornecedor' | 'super_admin';
  razao_social?: string;
  operador_logistico_cnpj?: string;
};

interface RegisterFormProps {
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const RegisterForm = ({ setError, setSuccess, setActiveTab }: RegisterFormProps) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signUp(
        data.email,
        data.password,
        data.nome,
        data.telefone,
        data.cnpj,
        data.tipo_usuario,
        data.razao_social,
        data.operador_logistico_cnpj
      );
      setActiveTab('login');
      setSuccess('Cadastro realizado com sucesso! Enviamos um email para confirmação. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.');
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setError('Este email já está cadastrado. Por favor, faça login ou utilize outro email.');
      } else {
        setError(error?.message || 'Ocorreu um erro ao fazer cadastro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          placeholder="Seu nome completo"
          {...register('nome', { required: 'Nome é obrigatório' })}
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="seu@email.com"
          {...register('email', { 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
        <select
          id="tipo_usuario"
          className="border rounded p-2 w-full"
          {...register('tipo_usuario', { required: 'Tipo de usuário é obrigatório' })}
          defaultValue={'transportador'}
        >
          <option value="transportador">Transportador</option>
          <option value="cliente">Cliente</option>
          <option value="fornecedor">Fornecedor</option>
        </select>
        {errors.tipo_usuario && (
          <p className="text-sm text-red-500">{errors.tipo_usuario.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="razao_social">Razão Social da Empresa</Label>
        <Input
          id="razao_social"
          placeholder="Empresa LTDA"
          {...register('razao_social')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da Empresa</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          {...register('cnpj')}
        />
        {errors.cnpj && (
          <p className="text-sm text-red-500">{errors.cnpj.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="operador_logistico_cnpj">CNPJ do Operador Logístico (se aplicável)</Label>
        <Input
          id="operador_logistico_cnpj"
          placeholder="00.000.000/0000-00"
          {...register('operador_logistico_cnpj')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone (opcional)</Label>
        <Input
          id="telefone"
          placeholder="(00) 00000-0000"
          {...register('telefone')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          type="password"
          {...register('password', { 
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'A senha deve ter pelo menos 6 caracteres'
            }
          })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
      
      <div className="mt-3 text-sm text-gray-500 text-center">
        Ao se cadastrar, você receberá um email de confirmação.
        <br />
        É necessário confirmar seu email antes de fazer login.
      </div>
    </form>
  );
};
