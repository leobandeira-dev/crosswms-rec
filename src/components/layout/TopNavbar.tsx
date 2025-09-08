import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Truck, PackageOpen, LayoutDashboard, MessageSquare, FileText, 
  Users, Settings, ChevronDown, LogOut, Package, Archive, Box, Map, Building, Building2, MapPin,
  Calculator, BarChart, PieChart, Table, Download, Printer, Search, Filter, List, Kanban,
  ClipboardList, CreditCard, FileSpreadsheet, Briefcase, BookUser, HelpCircle, Target,
  Bell, User, Trophy, Award, Star, Info, Shield, Crown, UserCheck, Factory, Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfileBadge } from '@/components/ProfileBadge';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  children?: React.ReactNode;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, children, active }) => {
  const [location] = useLocation();
  const isActive = active || (href && location === href);

  if (children) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 h-8 lg:h-9 rounded-xl transition-all duration-200 text-xs lg:text-sm font-semibold ${
              isActive 
                ? 'bg-blue-700 text-white shadow-md border border-blue-800' 
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Icon size={14} className="lg:w-4 lg:h-4" />
            <span className="hidden lg:inline whitespace-nowrap">{label}</span>
            <ChevronDown size={10} className="lg:w-3 lg:h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white rounded-xl">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link to={href || '#'}>
      <Button
        variant="ghost"
        className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 h-8 lg:h-9 rounded-xl transition-all duration-200 text-xs lg:text-sm font-semibold ${
          isActive 
            ? 'bg-blue-700 text-white shadow-md border border-blue-800' 
            : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-transparent'
        }`}
      >
        <Icon size={14} className="lg:w-4 lg:h-4" />
        <span className="hidden lg:inline whitespace-nowrap">{label}</span>
      </Button>
    </Link>
  );
};

// Helper function to get user type icon
const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case 'super_admin':
      return Crown;
    case 'transportador':
      return Truck;
    case 'cliente':
      return UserCheck;
    case 'fornecedor':
      return Factory;
    default:
      return User;
  }
};

// Helper function to get user type label
const getUserTypeLabel = (userType: string) => {
  switch (userType) {
    case 'super_admin':
      return 'Super Admin';
    case 'transportador':
      return 'Transportador';
    case 'cliente':
      return 'Cliente';
    case 'fornecedor':
      return 'Fornecedor';
    default:
      return 'Usuário';
  }
};

const TopNavbar: React.FC = () => {
  const { signOut, user } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="crosswms-navbar sticky top-0 z-50 bg-white">
      <div className="w-full mx-auto">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4 min-w-fit">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-900">
              CX
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-900 font-bold text-2xl tracking-tight">CrossWMS</div>
              <div className="text-xs text-blue-700 font-semibold -mt-1">Gestão Logística</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 mx-4 lg:mx-8">
            <div className="flex items-center justify-center space-x-1 px-2 lg:px-4 py-2">
              <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
              
              {/* Administração */}
              <NavItem icon={Briefcase} label="Admin">
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Dashboard Admin
                  </Link>
                </DropdownMenuItem>
                {user?.tipo_usuario === 'super_admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/empresas" className="flex items-center gap-2">
                        <Building2 size={16} />
                        Gestão de Empresas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/pacotes" className="flex items-center gap-2">
                        <Package size={16} />
                        Gestão de Pacotes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/aprovacao-transportadores" className="flex items-center gap-2">
                        <Users size={16} />
                        Aprovação Transportadores
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/apresentacao-comercial" className="flex items-center gap-2">
                        <Presentation size={16} />
                        Apresentação Comercial
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/admin/clientes" className="flex items-center gap-2">
                    <Users size={16} />
                    Clientes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    Financeiro
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/financeiro/recebimentos">
                        <CreditCard size={16} className="mr-2" />
                        Recebimentos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/financeiro/notas-fiscais">
                        <FileText size={16} className="mr-2" />
                        Notas Fiscais
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/suporte" className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    Suporte
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              {/* Coletas */}
              <NavItem icon={Truck} label="Coletas">
                <DropdownMenuItem asChild>
                  <Link to="/coletas" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Visão Geral
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coletas/solicitacoes" className="flex items-center gap-2">
                    <ClipboardList size={16} />
                    Solicitações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coletas/aprovacoes" className="flex items-center gap-2">
                    <Target size={16} />
                    Aprovações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coletas/alocacao-veiculos" className="flex items-center gap-2">
                    <Truck size={16} />
                    Alocação de Veículos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coletas/execucao" className="flex items-center gap-2">
                    <MapPin size={16} />
                    Execução
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              {/* Armazenagem */}
              <NavItem icon={Archive} label="Armazenagem">
                <DropdownMenuItem asChild>
                  <Link to="/armazenagem" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Visão Geral
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Package size={16} />
                    Recebimento
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/recebimento/ordemrecebimento">
                        <Box size={16} className="mr-2" />
                        Ordem de Recebimento
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/recebimento/notas">
                        <FileText size={16} className="mr-2" />
                        Notas Fiscais
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/geracao-etiquetas">
                        <FileText size={16} className="mr-2" />
                        Etiquetas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/expedicao/produtos-perigosos">
                        <Package size={16} className="mr-2" />
                        Produtos Perigosos
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Package size={16} />
                    Movimentações
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/movimentacoes">
                        <Box size={16} className="mr-2" />
                        Visão Geral
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/movimentacoes/unitizacao">
                        <Box size={16} className="mr-2" />
                        Unitização
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/movimentacoes/enderecamento">
                        <Box size={16} className="mr-2" />
                        Endereçamento
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                  <Link to="/armazenagem/rastreamento" className="flex items-center gap-2">
                    <MapPin size={16} />
                    Rastreamento
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Truck size={16} />
                    Carregamento
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento">
                        <Truck size={16} className="mr-2" />
                        Visão Geral
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/ordem">
                        <FileText size={16} className="mr-2" />
                        Ordem de Carregamento
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/conferencia">
                        <Search size={16} className="mr-2" />
                        Conferência
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/enderecamento">
                        <Box size={16} className="mr-2" />
                        Endereçamento
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/checklist">
                        <FileText size={16} className="mr-2" />
                        Checklist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/separacao">
                        <Package size={16} className="mr-2" />
                        Separação
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/armazenagem/carregamento/expedicao">
                        <Truck size={16} className="mr-2" />
                        Expedição
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                  <Link to="/armazenagem/fila-x" className="flex items-center gap-2">
                    <Package size={16} />
                    FilaX - Gestão de Pátio
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              {/* Marketplace de Cargas */}
              <NavItem icon={Map} label="Marketplace">
                <DropdownMenuItem asChild>
                  <Link to="/marketplace" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/marketplace/nova-ordem" className="flex items-center gap-2">
                    <Package size={16} />
                    Nova Ordem
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/marketplace/monitoramento" className="flex items-center gap-2">
                    <MapPin size={16} />
                    Monitoramento
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              {/* Gamificação */}
              <NavItem icon={Trophy} label="Conquistas" href="/conquistas" />

              {/* Cadastros */}
              <NavItem icon={FileText} label="Cadastros">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Users size={16} />
                    Usuários
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/usuarios/cadastro">
                        <Users size={16} className="mr-2" />
                        Cadastro
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/usuarios/permissoes">
                        <Settings size={16} className="mr-2" />
                        Permissões
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                  <Link to="/cadastros/enderecamento" className="flex items-center gap-2">
                    <MapPin size={16} />
                    Endereçamento
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              {/* Relatórios */}
              <NavItem icon={BarChart} label="Relatórios">
                <DropdownMenuItem asChild>
                  <Link to="/relatorios" className="flex items-center gap-2">
                    <BarChart size={16} />
                    Visão Geral
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/relatorios/armazenagem/volumes" className="flex items-center gap-2">
                    <Table size={16} />
                    Volumes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/relatorios/carregamento/ordens" className="flex items-center gap-2">
                    <Truck size={16} />
                    Carregamento
                  </Link>
                </DropdownMenuItem>
              </NavItem>

              <NavItem icon={MessageSquare} label="SAC" href="/sac" />
            </div>
          </div>

          {/* Right side - User Info, Notifications, Profile */}
          <div className="flex items-center gap-1 lg:gap-2 min-w-fit">
            
            {/* User Information Section - Responsive */}
            {user && (
              <div className="flex items-center gap-1 lg:gap-2">
                {/* Mobile: Compact badges */}
                <div className="flex flex-col gap-1 lg:hidden">
                  <div className="bg-[#0098DA] text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    {user.perfil?.nome || 'Perfil'}
                  </div>
                </div>

                {/* Desktop: Full information */}
                <div className="hidden lg:flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      {(user.empresa as any)?.tipo_empresa?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Empresa'}
                    </div>
                    <div className="bg-[#0098DA] text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      {user.perfil?.nome || 'Perfil não definido'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col text-xs space-y-0.5 max-w-xs">
                    <div className="font-bold text-gray-900 text-sm truncate">
                      {user.nome}
                    </div>
                    <div className="text-gray-700 font-medium truncate">
                      {(user.empresa as any)?.nome || 'Empresa não identificada'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      CNPJ: {(user.empresa as any)?.cnpj ? 
                        (user.empresa as any).cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : 
                        'Não informado'
                      }
                    </div>
                    <div className="text-gray-500 text-xs">
                      Login: {new Date().toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#0098DA] hover:bg-gray-100 rounded-xl transition-all duration-200 w-8 h-8 lg:w-10 lg:h-10">
              <Bell size={16} className="lg:w-5 lg:h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-600 hover:text-[#0098DA] hover:bg-gray-100 rounded-xl transition-all duration-200 w-8 h-8 lg:w-10 lg:h-10"
                >
                  <User size={16} className="lg:w-5 lg:h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-xl z-50"
                sideOffset={5}
                alignOffset={-5}
              >
                {user && (
                  <>
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0098DA] rounded-full flex items-center justify-center text-white font-medium">
                          {user.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {(() => {
                              const UserTypeIcon = getUserTypeIcon(user.funcao || 'super_admin');
                              return (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                  <UserTypeIcon size={12} className="text-gray-600" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {getUserTypeLabel(user.funcao || 'super_admin')}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                          {user.empresa && (
                            <div className="flex items-center gap-1 mt-1">
                              <Building size={10} className="text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">
                                {typeof user.empresa === 'string' ? user.empresa : (user.empresa as any)?.nome || 'Empresa'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/orientacao" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <Info size={16} className="text-gray-600" />
                        <span>Orientações do Sistema</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                    <Settings size={16} className="text-gray-600" />
                    <span className="font-medium">Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
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

export default TopNavbar;