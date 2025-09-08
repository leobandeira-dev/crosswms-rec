import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { toast } from '@/hooks/use-toast';

const AuthPageClient = () => {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
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
  }, [location]);

  // Redirect authenticated users based on their role
  useEffect(() => {
    console.log('AuthPage useEffect - user:', !!user, 'loading:', loading);
    
    if (user && !loading) {
      console.log('User object:', user);
      console.log('User tipo_usuario:', user.tipo_usuario);
      console.log('User tipo_usuario type:', typeof user.tipo_usuario);
      
      let redirectPath = '/dashboard'; // default
      
      // Determine redirect path based on user role
      switch (user.tipo_usuario) {
        case 'super_admin':
          redirectPath = '/admin/dashboard';
          console.log('Redirecting super_admin to:', redirectPath);
          break;
        case 'transportador':
          redirectPath = '/dashboard';
          console.log('Redirecting transportador to:', redirectPath);
          break;
        case 'cliente':
          redirectPath = '/cliente/dashboard';
          console.log('Redirecting cliente to:', redirectPath);
          break;
        case 'fornecedor':
          redirectPath = '/fornecedor/dashboard';
          console.log('Redirecting fornecedor to:', redirectPath);
          break;
        default:
          redirectPath = '/dashboard';
          console.log('Default redirection to:', redirectPath);
      }
      
      console.log('Final redirect path:', redirectPath, 'for user with role:', user.tipo_usuario);
      setLocation(redirectPath);
    }
  }, [user, loading, setLocation]);

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Verificando estado de autenticação...</p>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBackToLogin={handleBackToLogin}
        error={error}
        success={success}
        setError={setError}
        setSuccess={setSuccess}
      />
    );
  }

  return (
    <AuthCard
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      error={error}
      success={success}
      setError={setError}
      setSuccess={setSuccess}
      onForgotPassword={handleForgotPasswordClick}
    />
  );
};

export default AuthPageClient;
