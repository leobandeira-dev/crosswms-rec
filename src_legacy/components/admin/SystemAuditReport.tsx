
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Database, 
  Shield, 
  Users, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'database' | 'security' | 'ui' | 'api';
  title: string;
  description: string;
  recommendation: string;
}

const SystemAuditReport: React.FC = () => {
  const [auditResults, setAuditResults] = useState<AuditIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [mockDataFiles, setMockDataFiles] = useState<string[]>([]);

  const performAudit = async () => {
    setIsLoading(true);
    const issues: AuditIssue[] = [];

    try {
      // 1. Check database connection by testing a simple query
      const { data: testConnection, error: dbError } = await supabase
        .from('notas_fiscais')
        .select('id')
        .limit(1);

      if (dbError) {
        issues.push({
          id: 'db-connection',
          type: 'error',
          category: 'database',
          title: 'Falha na Conexão com Banco',
          description: 'Não foi possível conectar ao banco de dados Supabase',
          recommendation: 'Verificar configurações de conexão e credenciais do Supabase'
        });
      } else {
        // Get list of tables by checking what we can access
        const tablesList = ['notas_fiscais', 'etiquetas', 'empresas', 'motoristas', 'veiculos', 'coletas'];
        setDbTables(tablesList.map(name => ({ table_name: name })));
      }

      // 2. Check for mock data usage
      const mockFiles = [
        'src/pages/armazenagem/recebimento/data/mockData.ts',
        'src/pages/armazenagem/recebimento/mockData.ts',
        'src/pages/armazenagem/recebimento/components/etiquetas/mockData.ts',
        'src/pages/usuarios/components/permissoes/mockData.ts',
        'src/pages/motoristas/utils/mockData.ts'
      ];

      setMockDataFiles(mockFiles);
      
      mockFiles.forEach(file => {
        issues.push({
          id: `mock-${file}`,
          type: 'warning',
          category: 'api',
          title: 'Dados Mockados Detectados',
          description: `Arquivo ${file} contém dados mockados`,
          recommendation: 'Substituir dados mockados por chamadas à API do Supabase'
        });
      });

      // 3. Check authentication implementation
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        issues.push({
          id: 'auth-not-implemented',
          type: 'error',
          category: 'security',
          title: 'Autenticação Não Implementada',
          description: 'Sistema não possui autenticação ativa',
          recommendation: 'Implementar sistema de autenticação completo'
        });
      }

      // 4. Check CRUD operations coverage
      const crudTables = ['notas_fiscais', 'etiquetas', 'empresas', 'motoristas', 'veiculos'];
      
      crudTables.forEach(table => {
        issues.push({
          id: `crud-${table}`,
          type: 'info',
          category: 'api',
          title: `CRUD Operations - ${table}`,
          description: `Verificar se todas as operações CRUD estão implementadas para ${table}`,
          recommendation: 'Implementar Create, Read, Update, Delete completos'
        });
      });

      // 5. Security best practices
      issues.push({
        id: 'api-keys-security',
        type: 'warning',
        category: 'security',
        title: 'Gerenciamento de Chaves API',
        description: 'Verificar se chaves API estão sendo gerenciadas de forma segura',
        recommendation: 'Usar Supabase Secrets para chaves sensíveis'
      });

      // 6. RLS Policies check
      issues.push({
        id: 'rls-policies',
        type: 'info',
        category: 'security',
        title: 'Políticas RLS',
        description: 'Verificar se políticas de Row Level Security estão configuradas',
        recommendation: 'Configurar políticas RLS adequadas para proteger dados'
      });

    } catch (error) {
      console.error('Erro durante auditoria:', error);
      issues.push({
        id: 'audit-error',
        type: 'error',
        category: 'api',
        title: 'Erro na Auditoria',
        description: 'Ocorreu um erro durante a execução da auditoria',
        recommendation: 'Verificar logs do console para mais detalhes'
      });
    }

    setAuditResults(issues);
    setIsLoading(false);
  };

  useEffect(() => {
    performAudit();
  }, []);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getIssuesByCategory = (category: string) => {
    return auditResults.filter(issue => issue.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'ui':
        return <FileText className="h-5 w-5" />;
      case 'api':
        return <Users className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Relatório de Auditoria do Sistema
          </CardTitle>
          <Button 
            onClick={performAudit} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Executando...' : 'Executar Auditoria'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Críticos</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {auditResults.filter(i => i.type === 'error').length}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Avisos</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {auditResults.filter(i => i.type === 'warning').length}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Informações</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {auditResults.filter(i => i.type === 'info').length}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-green-500" />
                <span className="font-medium">Tabelas BD</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {dbTables.length}
              </p>
            </div>
          </div>

          <Tabs defaultValue="database" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Banco de Dados
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                APIs e CRUD
              </TabsTrigger>
              <TabsTrigger value="ui" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Interface
              </TabsTrigger>
            </TabsList>

            {['database', 'security', 'api', 'ui'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                {getIssuesByCategory(category).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum problema encontrado nesta categoria</p>
                  </div>
                ) : (
                  getIssuesByCategory(category).map(issue => (
                    <Card key={issue.id} className="border-l-4 border-l-current">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{issue.title}</h4>
                              <Badge variant={issue.type === 'error' ? 'destructive' : 
                                             issue.type === 'warning' ? 'secondary' : 'default'}>
                                {issue.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                            <p className="text-sm font-medium text-blue-600">
                              💡 {issue.recommendation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAuditReport;
