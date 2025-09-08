
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showDANFE: boolean;
}

/**
 * Component for selecting document layout type (standard, DANFE, simplified)
 */
const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  value,
  onChange,
  showDANFE
}) => {
  if (!showDANFE) {
    return null;
  }
  
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="default">Layout Padrão</TabsTrigger>
        <TabsTrigger value="danfe">DANFE</TabsTrigger>
        <TabsTrigger value="simplified">DANFE Simplificado</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LayoutSelector;
