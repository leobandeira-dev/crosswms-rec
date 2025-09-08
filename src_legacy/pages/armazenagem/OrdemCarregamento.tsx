import MainLayout from "@/components/layout/MainLayout";
import VisualizacaoOrdensRecebimento from "@/components/armazenagem/VisualizacaoOrdensRecebimento";
import { CheckSquare, Clipboard, MapPin, Package, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function OrdemCarregamento() {

  // Workflow steps navigation
  const workflowSteps = [
    { id: 1, title: "Ordem", path: "/armazenagem/carregamento/ordem", icon: Package, active: true },
    { id: 2, title: "Separação", path: "/armazenagem/carregamento/separacao", icon: Search, active: false },
    { id: 3, title: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: CheckSquare, active: false },
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: false },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: false },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: false }
  ];

  return (
    <MainLayout title="Ordem de Carregamento">
      <div className="container mx-auto px-4 py-8">
        {/* Workflow Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {workflowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.path}>
                    <Button
                      variant={step.active ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center space-x-2 ${step.active ? "bg-blue-600 text-white" : "bg-white text-gray-700 border-gray-300"
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden md:inline">{step.title}</span>
                    </Button>
                  </Link>
                  {index < workflowSteps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordens de Carregamento */}
        <VisualizacaoOrdensRecebimento />
      </div>
    </MainLayout>
  );
}

export default OrdemCarregamento;