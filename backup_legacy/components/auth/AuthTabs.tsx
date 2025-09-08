
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  onForgotPassword: () => void;
}

export const AuthTabs = ({ 
  activeTab, 
  setActiveTab, 
  error, 
  success, 
  setError, 
  setSuccess, 
  onForgotPassword 
}: AuthTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Cadastro</TabsTrigger>
      </TabsList>
      
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
      
      <TabsContent value="login">
        <LoginForm 
          onForgotPassword={onForgotPassword} 
          setError={setError} 
          setSuccess={setSuccess}
        />
      </TabsContent>
      
      <TabsContent value="register">
        <RegisterForm 
          setError={setError} 
          setSuccess={setSuccess} 
          setActiveTab={setActiveTab}
        />
      </TabsContent>
    </Tabs>
  );
};
