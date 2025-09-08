import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Smartphone, Wifi, Settings, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface MobileCameraGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileCameraGuide: React.FC<MobileCameraGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Guia de Integração - Câmera Mobile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Browser Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5" />
                  Compatibilidade de Navegadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Chrome Mobile 85+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Safari iOS 14.3+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Firefox Mobile 88+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Edge Mobile 85+</span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Importante:</strong> O acesso à câmera requer HTTPS em produção. 
                      Em desenvolvimento local, funciona com HTTP://localhost.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configuração do Dispositivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">1</Badge>
                    <div>
                      <h4 className="font-medium">Permissão de Câmera</h4>
                      <p className="text-sm text-gray-600">
                        Autorize o acesso à câmera quando solicitado pelo navegador
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">2</Badge>
                    <div>
                      <h4 className="font-medium">Conexão Segura</h4>
                      <p className="text-sm text-gray-600">
                        Certifique-se de estar em uma conexão HTTPS (ambiente de produção)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">3</Badge>
                    <div>
                      <h4 className="font-medium">Orientação do Dispositivo</h4>
                      <p className="text-sm text-gray-600">
                        Para melhor resultado, mantenha o celular na horizontal (landscape)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scanning Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5" />
                  Dicas para Escaneamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700">✓ Faça Assim</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Posicione o código de barras dentro da área vermelha</li>
                      <li>• Mantenha o celular estável</li>
                      <li>• Garanta boa iluminação</li>
                      <li>• Distância de 10-15cm do código</li>
                      <li>• Código de barras paralelo à tela</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700">✗ Evite</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Códigos borrados ou danificados</li>
                      <li>• Muita sombra sobre o código</li>
                      <li>• Movimento durante o escaneamento</li>
                      <li>• Distância muito próxima ou distante</li>
                      <li>• Código de barras cortado na imagem</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5" />
                  Detalhes Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Formatos Suportados</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• CODE-128 (NFe DANFE)</li>
                      <li>• EAN-13/UPC-A</li>
                      <li>• QR Code</li>
                      <li>• Data Matrix</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Especificações</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Resolução: 640x480 mínima</li>
                      <li>• Câmera traseira preferencial</li>
                      <li>• Auto-foco automático</li>
                      <li>• Processamento local no dispositivo</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Privacidade:</strong> Todo processamento é feito localmente no seu dispositivo. 
                      Nenhuma imagem é enviada para servidores externos.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Solução de Problemas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-700">Câmera não funciona</h4>
                    <ul className="text-sm text-gray-600 ml-4 mt-1">
                      <li>• Verifique as permissões do navegador</li>
                      <li>• Teste em modo privado/incógnito</li>
                      <li>• Reinicie o navegador</li>
                      <li>• Use entrada manual como alternativa</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-700">Código não é reconhecido</h4>
                    <ul className="text-sm text-gray-600 ml-4 mt-1">
                      <li>• Melhore a iluminação</li>
                      <li>• Ajuste a distância da câmera</li>
                      <li>• Certifique-se que o código está completo na tela</li>
                      <li>• Limpe a lente da câmera</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCameraGuide;