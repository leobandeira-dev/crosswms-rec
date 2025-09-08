import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Package, 
  Truck, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Clipboard,
  FileCheck,
  Search
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  submenu?: NavItem[];
}

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const handleLogout = () => {
    // Implement logout logic here
    window.location.href = '/auth';
  };

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Coletas", path: "/coletas/alocacao", icon: Package },
    { name: "Motoristas", path: "/motoristas", icon: Users },
    { name: "Configurações", path: "/configuracoes", icon: Settings },
  ];

  const armazenagemItems: NavItem[] = [
    { name: "Recebimento", path: "/armazenagem/recebimento", icon: Package },
    { name: "Movimentações", path: "/armazenagem/movimentacoes", icon: ClipboardList },
    { name: "Rastreamento", path: "/armazenagem/rastreamento", icon: Search },
    { 
      name: "Carregamento", 
      path: "/armazenagem/carregamento", 
      icon: Truck,
      submenu: [
        { name: "Visão Geral", path: "/armazenagem/carregamento", icon: ClipboardList },
        { name: "Ordem de Carregamento", path: "/armazenagem/carregamento/ordem", icon: Truck },
        { name: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: Search },
        { name: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin },
        { name: "Checklist", path: "/armazenagem/carregamento/checklist", icon: FileCheck },
        { name: "Separação", path: "/armazenagem/carregamento/separacao", icon: Package },
        { name: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck }
      ]
    }
  ];

  const isActivePath = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  WMS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActivePath(item.path) ? "default" : "ghost"}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Armazenagem Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={location.startsWith("/armazenagem") ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Armazenagem
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {armazenagemItems.map((item) => {
                    const IconComponent = item.icon;
                    if (item.submenu) {
                      return (
                        <div key={item.path}>
                          <DropdownMenuItem asChild>
                            <Link href={item.path} className="flex items-center gap-2 w-full">
                              <IconComponent className="h-4 w-4" />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
                            {item.submenu.map((subItem) => {
                              const SubIconComponent = subItem.icon;
                              return (
                                <DropdownMenuItem key={subItem.path} asChild>
                                  <Link href={subItem.path} className="flex items-center gap-2 w-full text-sm">
                                    <SubIconComponent className="h-3 w-3" />
                                    {subItem.name}
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link href={item.path} className="flex items-center gap-2 w-full">
                          <IconComponent className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* Desktop logout */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    className="w-full justify-start flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            
            {/* Mobile Armazenagem section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="px-2 mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Armazenagem
                </span>
              </div>
              {armazenagemItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.path}>
                    <Link href={item.path}>
                      <Button
                        variant={isActivePath(item.path) ? "default" : "ghost"}
                        className="w-full justify-start flex items-center gap-2 ml-4"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                    {item.submenu && (
                      <div className="ml-8 border-l border-gray-200 dark:border-gray-700 pl-2">
                        {item.submenu.map((subItem) => {
                          const SubIconComponent = subItem.icon;
                          return (
                            <Link key={subItem.path} href={subItem.path}>
                              <Button
                                variant={isActivePath(subItem.path) ? "default" : "ghost"}
                                className="w-full justify-start flex items-center gap-2 text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <SubIconComponent className="h-3 w-3" />
                                {subItem.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}