import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  CheckSquare, 
  MapPin, 
  Clipboard,
  ArrowRight,
  Truck,
  Clock,
  User
} from "lucide-react";

export default function CarregamentoIndex() {
  // Workflow steps in the correct order
  const workflowSteps = [
    {
      id: 1,
      title: "Ordem",
      description: "Criação e gerenciamento de ordens de carregamento",
      path: "/armazenagem/carregamento/ordem",
      icon: ClipboardList,
      status: "active",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Conferência", 
      description: "Verificação e validação dos volumes",
      path: "/armazenagem/carregamento/conferencia",
      icon: CheckSquare,
      status: "pending",
      color: "bg-orange-500"
    },
    {
      id: 3,
      title: "Endereçamento",
      description: "Posicionamento dos volumes no veículo",
      path: "/armazenagem/carregamento/enderecamento",
      icon: MapPin,
      status: "pending",
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Checklist",
      description: "Verificação final e liberação do carregamento",
      path: "/armazenagem/carregamento/checklist",
      icon: Clipboard,
      status: "pending",
      color: "bg-green-500"
    }
  ];

  // Sample data for active loading orders
  const activeOrders = [
    {
      id: "ORD-001",
      motorista: "João Silva",
      veiculo: "ABC-1234",
      volumes: 15,
      status: "Em Conferência",
      previsao: "14:30"
    },
    {
      id: "ORD-002", 
      motorista: "Maria Santos",
      veiculo: "DEF-5678",
      volumes: 8,
      status: "Endereçamento",
      previsao: "15:15"
    },
    {
      id: "ORD-003",
      motorista: "Carlos Lima",
      veiculo: "GHI-9012",
      volumes: 22,
      status: "Checklist",
      previsao: "16:00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Em Conferência": return "bg-orange-100 text-orange-800";
      case "Endereçamento": return "bg-purple-100 text-purple-800";
      case "Checklist": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout title="Sistema de Carregamento">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-gray-600">
            Gerencie todas as etapas do processo de carregamento de veículos
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Fluxo de Trabalho
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Link key={step.id} href={step.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${step.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge variant="outline">{step.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-1">{step.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {step.description}
                      </CardDescription>
                      <div className="mt-3">
                        <Button variant="ghost" size="sm" className="w-full">
                          Acessar <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ordens em Andamento
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{order.motorista}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>{order.veiculo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClipboardList className="h-4 w-4" />
                    <span>{order.volumes} volumes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Previsão: {order.previsao}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Visualizar Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}