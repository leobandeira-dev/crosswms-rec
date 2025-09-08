import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { toast } from '@/hooks/use-toast';

const AuthPageOriginal = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Check URL parameters to determine which tab to show and handle confirmation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('register') === 'true') {
      setActiveTab('register');
    }
    if (params.get('forgotPassword') === 'true') {
      setShowForgotPassword(true);
    }
    if (params.get('confirmed') === 'true') {
      toast({
        title: "Email confirmado com sucesso!",
        description: "Seu email foi confirmado. Agora você pode fazer login no sistema.",
        variant: "default",
      });
      setSuccess("Email confirmado com sucesso! Agora você pode fazer login no sistema.");
      setActiveTab('login');
    }
    
    // Verificar se o erro está relacionado à confirmação de email
    const errorCode = params.get('error');
    if (errorCode === 'email-confirmation-error') {
      setError("Houve um problema ao confirmar seu email. Por favor, tente novamente ou entre em contato com o suporte.");
    }
  }, []);

  // Get the intended destination from location state or default to dashboard
  const from = '/dashboard';

  // Redirect authenticated users
  useEffect(() => {
    console.log('AuthPage useEffect - user:', !!user, 'loading:', loading);
    if (user && !loading) {
      console.log('User authenticated, redirecting to:', from);
      setLocation(from);
    }
  }, [user, loading, from, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <ForgotPasswordForm 
            onBackToLogin={() => setShowForgotPassword(false)}
            error={error}
            success={success}
            setError={setError}
            setSuccess={setSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            CrossWMS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão Logística
          </p>
        </div>
        
        <AuthCard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          error={error}
          success={success}
          setError={setError}
          setSuccess={setSuccess}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      </div>
    </div>
  );
};

export default AuthPageOriginal;
