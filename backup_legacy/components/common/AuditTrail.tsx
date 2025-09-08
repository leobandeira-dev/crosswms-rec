
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useAuditTrail, AuditEntry } from '@/hooks/useAuditTrail';

export interface AuditTrailProps {
  moduleId: string;
  entityId?: string;
  maxItems?: number;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ moduleId, entityId, maxItems = 5 }) => {
  const { user } = useAuth();
  const { auditEntries, loading } = useAuditTrail(moduleId, entityId);

  // Determinar se o usuário pode ver os logs de auditoria
  // Usuários com perfil admin podem ver todos os logs
  const canViewAudit = user?.perfil?.nome === 'admin' || (user?.perfil?.permissoes && user?.perfil?.permissoes['audit:view']);

  if (!canViewAudit) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : auditEntries.length > 0 ? (
          <div className="space-y-4">
            {auditEntries.slice(0, maxItems).map((log, index) => (
              <React.Fragment key={log.id || index}>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{log.username}</span>
                    <span className="text-muted-foreground"> {log.action}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {log.timestamp.toLocaleString()}
                  </span>
                </div>
                {index < auditEntries.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhuma atividade registrada.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
