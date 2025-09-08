import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Package, 
  Truck, 
  Users, 
  Settings, 
  LogOut, 
  ChevronDown,
  Home,
  FileText,
  BarChart3,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const MainNavbar: React.FC = () => {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: 'Coletas',
      path: '/coletas',
      icon: Truck,
      color: 'text-green-600',
      submenu: [
        { title: 'Nova Ordem', path: '/coletas/nova-ordem' },
        { title: 'Solicitações', path: '/coletas/solicitacoes' },
        { title: 'Programação', path: '/coletas/programacao' },
        { title: 'Relatórios', path: '/coletas/relatorios' }
      ]
    },
    {
      title: 'Armazenagem',
      path: '/armazenagem',
      icon: Package,
      color: 'text-purple-600',
      submenu: [
        { title: 'Dashboard', path: '/armazenagem' },
        { title: 'Conferência', path: '/armazenagem/conferencia' },
        { title: 'Endereçamento', path: '/armazenagem/enderecamento' },
        { title: 'Checklist', path: '/armazenagem/checklist' }
      ]
    },
    {
      title: 'Carregamento',
      path: '/carregamento',
      icon: FileText,
      color: 'text-orange-600',
      submenu: [
        { title: 'Planejamento', path: '/carregamento/planejamento' },
        { title: 'Ordem de Carga', path: '/carregamento/ordem-carga' },
        { title: 'Execução', path: '/carregamento/execucao' },
        { title: 'Rastreamento', path: '/carregamento/rastreamento' }
      ]
    },
    {
      title: 'Relatórios',
      path: '/relatorios',
      icon: BarChart3,
      color: 'text-indigo-600'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0098DA] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CX</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CrossWMS</h1>
                <p className="text-xs text-slate-500">Gestão Logística</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.submenu) {
                return (
                  <DropdownMenu key={item.path}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'bg-[#0098DA]/10 text-[#0098DA]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive(item.path) ? item.color : ''}`} />
                        <span>{item.title}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.submenu.map((subItem) => (
                        <DropdownMenuItem key={subItem.path} asChild>
                          <Link
                            href={subItem.path}
                            className={`flex items-center px-2 py-2 text-sm ${
                              location === subItem.path
                                ? 'bg-[#0098DA]/10 text-[#0098DA]'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#0098DA]/10 text-[#0098DA]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive(item.path) ? item.color : ''}`} />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;