
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditTrail from './AuditTrail';
import { useAuth } from '@/hooks/useAuth';

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsWithAuditProps {
  tabs: TabItem[];
  defaultValue?: string;
  moduleId: string;
  entityId?: string;
  className?: string;
}

const TabsWithAudit: React.FC<TabsWithAuditProps> = ({
  tabs,
  defaultValue,
  moduleId,
  entityId,
  className = '',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  // Determinar se o usuário pode ver os logs de auditoria
  const canViewAudit = user?.perfil?.nome === 'admin' || (user?.perfil?.permissoes && user?.perfil?.permissoes['audit:view']);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`lg:col-span-2 ${className}`}>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-{tabs.length} mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {canViewAudit && (
        <div className="lg:col-span-1">
          <AuditTrail moduleId={moduleId} entityId={entityId} />
        </div>
      )}
    </div>
  );
};

export default TabsWithAudit;
