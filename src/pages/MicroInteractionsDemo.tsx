import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Send, 
  Download, 
  Upload, 
  Search, 
  Check,
  Heart,
  Star,
  Zap
} from 'lucide-react';

const MicroInteractionsDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Reset success state after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);
    
    if (value.length > 0) {
      const isValid = validateEmail(value);
      setIsValidEmail(isValid);
      setIsInvalidEmail(!isValid);
    } else {
      setIsValidEmail(false);
      setIsInvalidEmail(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
          Micro-Interações
        </h1>
        <p className="text-gray-600 mt-2 animate-fade-in-up animation-delay-100">
          Demonstração de feedbacks visuais e animações interativas
        </p>
      </div>

      {/* Interactive Buttons Section */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Botões Interativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Botão com Estados</h4>
              <InteractiveButton
                onClick={handleButtonClick}
                isLoading={isLoading}
                isSuccess={isSuccess}
                loadingText="Salvando..."
                successText="Salvo!"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </InteractiveButton>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Botão com Ripple</h4>
              <InteractiveButton 
                ripple={true}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </InteractiveButton>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Botão com Bounce</h4>
              <InteractiveButton 
                bounce={true}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </InteractiveButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InteractiveButton 
              pulse={true}
              className="bg-purple-600 hover:bg-purple-700 animate-glow"
            >
              <Star className="w-4 h-4 mr-2" />
              Destaque
            </InteractiveButton>

            <InteractiveButton 
              variant="outline"
              className="hover:animate-wiggle"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favoritar
            </InteractiveButton>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Inputs Section */}
      <Card className="animate-fade-in-up animation-delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Inputs Interativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Input com Animações</h4>
              <InteractiveInput
                placeholder="Digite algo aqui..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                animateOnFocus={true}
                glowOnFocus={true}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Validação de Email</h4>
              <InteractiveInput
                type="email"
                placeholder="seu@email.com"
                value={emailValue}
                onChange={handleEmailChange}
                isValid={isValidEmail}
                isInvalid={isInvalidEmail}
                validationMessage={
                  isValidEmail 
                    ? "Email válido!" 
                    : isInvalidEmail 
                    ? "Formato de email inválido" 
                    : undefined
                }
                animateOnFocus={true}
                glowOnFocus={true}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Input com Loading</h4>
            <InteractiveInput
              placeholder="Verificando disponibilidade..."
              isLoading={true}
              animateOnFocus={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Animation Showcase */}
      <Card className="animate-fade-in-up animation-delay-400">
        <CardHeader>
          <CardTitle>Galeria de Animações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto animate-bounce-soft"></div>
              <p className="text-xs">Bounce Soft</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto animate-float"></div>
              <p className="text-xs">Float</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto animate-heartbeat"></div>
              <p className="text-xs">Heartbeat</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto animate-wiggle"></div>
              <p className="text-xs">Wiggle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Feedback Elements */}
      <Card className="animate-fade-in-up animation-delay-600">
        <CardHeader>
          <CardTitle>Elementos de Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Barra de Progresso Animada</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Badges Interativos</h4>
            <div className="flex gap-2">
              <Badge className="animate-scale-in hover:animate-bounce-soft cursor-pointer">
                Novo
              </Badge>
              <Badge variant="destructive" className="animate-scale-in animation-delay-100 hover:animate-shake cursor-pointer">
                Urgente
              </Badge>
              <Badge variant="outline" className="animate-scale-in animation-delay-200 hover:animate-glow cursor-pointer">
                Em Análise
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Cards com Hover Effects</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm">Hover para Scale</p>
                </CardContent>
              </Card>

              <Card className="hover:animate-bounce-soft transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Hover para Bounce</p>
                </CardContent>
              </Card>

              <Card className="hover:animate-glow transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm">Hover para Glow</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroInteractionsDemo;