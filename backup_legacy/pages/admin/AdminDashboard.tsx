
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Receipt, Package, Key, Headphones, Kanban, Lock } from 'lucide-react';

const AdminDashboard = () => {
  const adminModules = [
    {
      title: 'Clientes',
      description: 'Gerencie todos os clientes da plataforma',
      icon: Users,
      path: '/admin/clientes',
    },
    {
      title: 'Recebimentos',
      description: 'Gerencie pagamentos e recebimentos',
      icon: Receipt,
      path: '/admin/financeiro/recebimentos',
    },
    {
      title: 'Notas Fiscais',
      description: 'Gerencie e envie notas fiscais',
      icon: Receipt,
      path: '/admin/financeiro/notas-fiscais',
    },
    {
      title: 'Pacotes',
      description: 'Configure pacotes e funcionalidades',
      icon: Package,
      path: '/admin/produtos/pacotes',
    },
    {
      title: 'Acessos',
      description: 'Gerencie permissões e acessos',
      icon: Key,
      path: '/admin/acessos',
    },
    {
      title: 'Reset de Senhas',
      description: 'Gerencie resets de senha dos usuários',
      icon: Lock,
      path: '/admin/acessos/reset-senhas',
    },
    {
      title: 'Suporte',
      description: 'Atenda chamados de suporte',
      icon: Headphones,
      path: '/admin/suporte',
    },
    {
      title: 'Leads',
      description: 'Gerencie potenciais clientes',
      icon: Kanban,
      path: '/admin/leads',
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
        <p className="text-muted-foreground mb-8">
          Bem-vindo ao painel administrativo da plataforma. Aqui você pode gerenciar todos os aspectos do sistema.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminModules.map((module) => (
            <Link to={module.path} key={module.title} className="no-underline text-foreground">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xl font-bold">{module.title}</CardTitle>
                  <module.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
