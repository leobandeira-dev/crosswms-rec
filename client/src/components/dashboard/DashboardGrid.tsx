import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ConfigurableWidget from './ConfigurableWidget';
import WidgetFactory from './WidgetFactory';
import { WidgetConfig, WidgetData } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetConfig[];
  widgetData: Record<string, WidgetData>;
  isEditMode: boolean;
  onLayoutChange: (layout: Layout[], layouts: { [key: string]: Layout[] }) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetRefresh: (widgetId: string) => void;
  onWidgetVisibilityToggle: (widgetId: string) => void;
  className?: string;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  widgetData,
  isEditMode,
  onLayoutChange,
  onWidgetRemove,
  onWidgetRefresh,
  onWidgetVisibilityToggle,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const breakpoints = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0
  };

  const cols = {
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
    xxs: 1
  };

  const layouts = widgets.reduce((acc, widget) => {
    if (!acc.lg) acc.lg = [];
    acc.lg.push({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: widget.size.minW || 1,
      maxW: widget.size.maxW || 4,
      minH: widget.size.minH || 1,
      maxH: widget.size.maxH || 6
    });
    return acc;
  }, {} as { [key: string]: Layout[] });

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    onLayoutChange(layout, layouts);
  }, [onLayoutChange]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full",
        isEditMode && "bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-lg p-4",
        className
      )}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={120}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
        draggableHandle=".drag-handle"
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-container">
            <ConfigurableWidget
              widget={widget}
              data={widgetData[widget.id]}
              isEditMode={isEditMode}
              isDragging={isDragging}
              onRemove={() => onWidgetRemove(widget.id)}
              onRefresh={() => onWidgetRefresh(widget.id)}
              onToggleVisibility={() => onWidgetVisibilityToggle(widget.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragStop}
              className="h-full"
            >
              <WidgetFactory
                type={widget.type}
                data={widgetData[widget.id]}
                settings={widget.settings}
              />
            </ConfigurableWidget>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Edit Mode Overlay */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardGrid;