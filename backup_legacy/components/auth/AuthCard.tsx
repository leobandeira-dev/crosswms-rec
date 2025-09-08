
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthTabs } from './AuthTabs';

interface AuthCardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  onForgotPassword: () => void;
}

export const AuthCard = ({
  activeTab,
  setActiveTab,
  error,
  success,
  setError,
  setSuccess,
  onForgotPassword
}: AuthCardProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="mb-6 w-full max-w-md">
        <Button variant="link" asChild className="p-0">
          <Link to="/" className="flex items-center text-primary">
            <ExternalLink className="mr-2 h-4 w-4" />
            Voltar para a página inicial
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sistema Logístico</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            error={error}
            success={success}
            setError={setError}
            setSuccess={setSuccess}
            onForgotPassword={onForgotPassword}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <p className="text-sm text-center text-muted-foreground">
            Ao continuar, você concorda com os termos de serviço e políticas de privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
