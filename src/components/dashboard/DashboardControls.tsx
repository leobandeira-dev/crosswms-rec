import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Plus, 
  Save, 
  Layout, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Grid,
  Download,
  Upload
} from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WidgetType, DashboardLayout, WidgetConfig } from '@/types/dashboard';

interface DashboardControlsProps {
  isEditMode: boolean;
  currentLayout: DashboardLayout;
  availableLayouts: DashboardLayout[];
  onToggleEditMode: () => void;
  onAddWidget: (widgetType: WidgetType) => void;
  onSaveLayout: (name: string) => Promise<void>;
  onLoadLayout: (layoutId: string) => void;
  onRefreshAll: () => void;
  className?: string;
}

const availableWidgetTypes: Array<{ type: WidgetType; label: string; description: string }> = [
  { type: 'stat_card', label: 'Cartões de Estatística', description: 'Métricas principais em formato de cartão' },
  { type: 'kpi_chart', label: 'Gráficos KPI', description: 'Indicadores de performance em gráficos' },
  { type: 'process_timeline', label: 'Timeline de Processos', description: 'Linha do tempo dos processos logísticos' },
  { type: 'pending_approvals', label: 'Aprovações Pendentes', description: 'Lista de itens aguardando aprovação' },
  { type: 'operational_metrics', label: 'Métricas Operacionais', description: 'Dados operacionais em tempo real' },
  { type: 'recent_activities', label: 'Atividades Recentes', description: 'Log das últimas atividades do sistema' },
  { type: 'logistics_overview', label: 'Visão Geral Logística', description: 'Resumo das operações logísticas' },
  { type: 'warehouse_status', label: 'Status do Armazém', description: 'Situação atual do armazém' },
  { type: 'fleet_management', label: 'Gestão de Frota', description: 'Controle da frota de veículos' },
  { type: 'gamification_summary', label: 'Gamificação', description: 'Pontuações e conquistas dos usuários' }
];

const DashboardControls: React.FC<DashboardControlsProps> = ({
  isEditMode,
  currentLayout,
  availableLayouts,
  onToggleEditMode,
  onAddWidget,
  onSaveLayout,
  onLoadLayout,
  onRefreshAll,
  className
}) => {
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaveLayout = async () => {
    if (newLayoutName.trim()) {
      try {
        await onSaveLayout(newLayoutName.trim());
        setShowSaveDialog(false);
        setNewLayoutName('');
      } catch (error) {
        console.error('Error saving layout:', error);
      }
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await onRefreshAll();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const controlsVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      variants={controlsVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          <Badge variant={isEditMode ? "default" : "secondary"}>
            {isEditMode ? "Modo Edição" : "Visualização"}
          </Badge>
        </div>

        <div className="text-sm text-gray-500">
          Layout: <span className="font-medium">{currentLayout.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh All Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <LoadingIndicator variant="spinner" size="sm" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? 'Atualizando...' : 'Atualizar Tudo'}
        </Button>

        {/* Layout Management */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Layout className="h-4 w-4 mr-2" />
              Layouts
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Layouts Salvos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableLayouts.map((layout) => (
              <DropdownMenuItem
                key={layout.id}
                onClick={() => onLoadLayout(layout.id)}
                className="flex items-center justify-between"
              >
                <span>{layout.name}</span>
                {layout.isDefault && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Layout Atual
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Widget Button */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <DropdownMenu open={showAddWidget} onOpenChange={setShowAddWidget}>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Widgets Disponíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableWidgetTypes.map((widget) => (
                    <DropdownMenuItem
                      key={widget.type}
                      onClick={() => {
                        onAddWidget(widget.type);
                        setShowAddWidget(false);
                      }}
                      className="flex flex-col items-start gap-1 p-3"
                    >
                      <div className="font-medium">{widget.label}</div>
                      <div className="text-xs text-gray-500">{widget.description}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Mode Toggle */}
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleEditMode}
          className="flex items-center gap-2"
        >
          {isEditMode ? (
            <>
              <Eye className="h-4 w-4" />
              Finalizar Edição
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Editar Dashboard
            </>
          )}
        </Button>
      </div>

      {/* Save Layout Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Layout do Dashboard</DialogTitle>
            <DialogDescription>
              Crie um novo layout personalizado com as configurações atuais dos widgets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="layout-name" className="text-right">
                Nome
              </Label>
              <Input
                id="layout-name"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                className="col-span-3"
                placeholder="Digite o nome do layout"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLayout} disabled={!newLayoutName.trim()}>
              Salvar Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default DashboardControls;