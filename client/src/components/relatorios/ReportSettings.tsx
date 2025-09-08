
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReportSettingsProps {
  updateSettings: (settings: any) => void;
  defaultSettings?: any;
}

const ReportSettings: React.FC<ReportSettingsProps> = ({ updateSettings, defaultSettings = {} }) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    chartType: defaultSettings.chartType || 'bar',
    showLegend: defaultSettings.showLegend !== false,
    showGrid: defaultSettings.showGrid !== false,
    dateRange: defaultSettings.dateRange || '7d',
    autoRefresh: defaultSettings.autoRefresh !== false,
    ...defaultSettings
  });

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updateSettings(settings);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Settings className="h-4 w-4 mr-2" />
        Configurações
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurações do Relatório</DialogTitle>
            <DialogDescription>
              Personalize a visualização e comportamento deste relatório.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chartType" className="text-right">
                Tipo de Gráfico
              </Label>
              <Select
                value={settings.chartType}
                onValueChange={(value) => handleChange("chartType", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateRange" className="text-right">
                Período
              </Label>
              <Select
                value={settings.dateRange}
                onValueChange={(value) => handleChange("dateRange", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showLegend" className="text-right">
                Mostrar Legenda
              </Label>
              <div className="col-span-3">
                <Switch
                  id="showLegend"
                  checked={settings.showLegend}
                  onCheckedChange={(checked) => handleChange("showLegend", checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showGrid" className="text-right">
                Mostrar Grade
              </Label>
              <div className="col-span-3">
                <Switch
                  id="showGrid"
                  checked={settings.showGrid}
                  onCheckedChange={(checked) => handleChange("showGrid", checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="autoRefresh" className="text-right">
                Atualização Automática
              </Label>
              <div className="col-span-3">
                <Switch
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => handleChange("autoRefresh", checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Aplicar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportSettings;
