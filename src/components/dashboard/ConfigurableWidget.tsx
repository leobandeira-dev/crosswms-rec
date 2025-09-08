import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  X, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff,
  GripVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetConfig, WidgetData } from '@/types/dashboard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

interface ConfigurableWidgetProps {
  widget: WidgetConfig;
  data?: WidgetData;
  isEditMode: boolean;
  isDragging: boolean;
  children: React.ReactNode;
  onRemove?: () => void;
  onRefresh?: () => void;
  onToggleVisibility?: () => void;
  onResize?: (size: { w: number; h: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

const ConfigurableWidget: React.FC<ConfigurableWidgetProps> = ({
  widget,
  data,
  isEditMode,
  isDragging,
  children,
  onRemove,
  onRefresh,
  onToggleVisibility,
  onResize,
  onDragStart,
  onDragEnd,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const widgetVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    collapsed: { 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: { 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const handleDragStart = () => {
    if (isEditMode && onDragStart) {
      onDragStart();
    }
  };

  const handleDragEnd = () => {
    if (isEditMode && onDragEnd) {
      onDragEnd();
    }
  };

  if (!widget.isVisible) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={widget.id}
        variants={widgetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className={cn(
          "relative group",
          isEditMode && "cursor-move",
          isDragging && "opacity-50",
          className
        )}
        ref={dragRef}
        draggable={isEditMode}
        onDragStart={(e) => handleDragStart()}
        onDragEnd={(e) => handleDragEnd()}
      >
        <Card className={cn(
          "h-full transition-all duration-300 ease-in-out",
          isEditMode && "ring-2 ring-blue-200 hover:ring-blue-400",
          isExpanded && "z-10",
          data?.isLoading && "animate-pulse"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {isEditMode && (
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab drag-handle" />
              )}
              {widget.title}
              {data?.isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </CardTitle>
            
            <AnimatePresence>
              {(isEditMode || showSettings) && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-1"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={onRefresh}
                    disabled={data?.isLoading}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-3 w-3" />
                    ) : (
                      <Maximize2 className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  
                  {isEditMode && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={onToggleVisibility}
                      >
                        {widget.isVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={onRemove}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <motion.div
            variants={contentVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            <CardContent className="pt-0">
              {data?.error ? (
                <div className="text-red-500 text-sm p-4 text-center">
                  Error: {data.error}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {children}
                </motion.div>
              )}
            </CardContent>
          </motion.div>

          {/* Loading overlay */}
          <AnimatePresence>
            {data?.isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
              >
                <LoadingIndicator 
                  variant="corporate" 
                  size="md" 
                  text="Carregando dados..." 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-20 p-4 mt-1"
              >
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Configurações do Widget</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Intervalo de Atualização</label>
                    <select className="w-full text-xs border rounded px-2 py-1">
                      <option value="30000">30 segundos</option>
                      <option value="60000">1 minuto</option>
                      <option value="300000">5 minutos</option>
                      <option value="0">Manual</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowSettings(false)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfigurableWidget;