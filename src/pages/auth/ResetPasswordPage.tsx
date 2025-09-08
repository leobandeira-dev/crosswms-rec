import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Shield, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Extrair token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token de redefinição não encontrado na URL');
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          title: "Sucesso",
          description: "Sua senha foi redefinida com sucesso!",
        });
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      } else {
        setError(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <CardTitle className="text-xl text-green-800">Senha Redefinida</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Sua senha foi alterada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-700 mb-4">
                Você será redirecionado para a página de login em instantes...
              </p>
              <Button
                onClick={() => setLocation('/login')}
                className="bg-green-600 hover:bg-green-700"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-xl text-blue-800">Redefinir Senha</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              Digite sua nova senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="text-center">
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center justify-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-red-800">Token de redefinição inválido</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation('/login')}
                  variant="outline"
                  className="mt-4"
                >
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Digite sua nova senha"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Confirme sua nova senha"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Redefinir Senha"}
                </Button>

                {/* Feedback de erro */}
                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center pt-4 border-t">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => setLocation('/login')}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}