import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  FileText,
  Search,
  Download,
  QrCode,
  Building,
  MapPin,
  Calculator,
  Printer,
  Eye,
  Grid3X3,
  ClipboardCheck,
  Trophy,
  Target,
  Boxes,
  Route,
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function LandingPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CrossWMS</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#solucoes" className="text-gray-600 hover:text-blue-600 transition-colors">Soluções</a>
              <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">Funcionalidades</a>
              <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">Benefícios</a>
              <Link href="/auth">
                <Button variant="outline" className="mr-2">Entrar</Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                Gestão Logística Inteligente
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Transforme sua
                <span className="text-blue-600 block">Operação Logística</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Elimine gargalos, reduza custos e acelere suas entregas com nossa plataforma completa de gestão de armazém e marketplace de cargas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    Acessar Sistema
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardContent className="p-4">
                      <TrendingUp className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">+250%</div>
                      <div className="text-sm opacity-90">Eficiência</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardContent className="p-4">
                      <Clock className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">70%</div>
                      <div className="text-sm opacity-90">Menos Tempo</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardContent className="p-4">
                      <Users className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm opacity-90">Empresas</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardContent className="p-4">
                      <Shield className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">99.9%</div>
                      <div className="text-sm opacity-90">Uptime</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Você reconhece esses desafios?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas de logística enfrentam problemas complexos que impactam diretamente nos resultados
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Processos Manuais</h3>
                <p className="text-gray-600">
                  Digitação manual de notas fiscais, planilhas desatualizadas e retrabalho constante consomem tempo valioso da equipe.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Falta de Visibilidade</h3>
                <p className="text-gray-600">
                  Sem controle em tempo real da operação, é impossível identificar gargalos e otimizar processos.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-yellow-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Integração Limitada</h3>
                <p className="text-gray-600">
                  Sistemas isolados que não conversam entre si, gerando informações desencontradas e erros operacionais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solucoes" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Nossa Solução
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Plataforma Completa de Gestão Logística
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformamos sua operação com tecnologia avançada e automação inteligente
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Automação de NFe</h3>
                    <p className="text-gray-600">
                      Importação automática de notas fiscais apenas pela chave de 44 dígitos, sem necessidade de certificado digital. Elimine a digitação manual.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Volumes</h3>
                    <p className="text-gray-600">
                      Controle preciso de cubagem, peso e dimensões com cálculo automático de m³ para otimização de cargas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Avançado</h3>
                    <p className="text-gray-600">
                      Dashboards em tempo real com métricas de performance, gamificação e indicadores de produtividade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Pacotes Disponíveis</h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6" />
                      <span className="font-semibold">Armazenagem</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Completo</Badge>
                  </div>
                  <p className="text-sm text-white/80">Dashboard • Conferência • Endereçamento • Checklist</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-6 w-6" />
                      <span className="font-semibold">Coletas</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Completo</Badge>
                  </div>
                  <p className="text-sm text-white/80">Ordem de Carga • NFe Processing • Cubagem</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Route className="h-6 w-6" />
                      <span className="font-semibold">Carregamento</span>
                    </div>
                    <Badge className="bg-green-500 text-white">Completo</Badge>
                  </div>
                  <p className="text-sm text-white/80">Ordem de Carregamento • Romaneio • Relatórios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua logística?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já otimizaram suas operações com CrossWMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">CrossWMS</span>
              </div>
              <p className="text-gray-400">
                Plataforma completa de gestão logística para empresas que buscam excelência operacional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CrossWMS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
