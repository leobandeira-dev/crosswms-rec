import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Menu, 
  X, 
  Home, 
  Truck, 
  BarChart3, 
  Settings, 
  User,
  Bell,
  Search,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ModernNavigation = () => {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Armazenagem', href: '/armazenagem', icon: Package },
    { name: 'Coletas', href: '/coletas', icon: Truck },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ];

  const isActive = (href: string) => location.startsWith(href);

  return (
    <nav className="crosswms-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="bg-[#0098DA] p-2.5 rounded-xl transition-transform group-hover:scale-105">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">CrossWMS</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive(item.href) 
                      ? 'bg-[#0098DA] text-white shadow-lg shadow-[#0098DA]/25' 
                      : 'text-gray-700 hover:text-[#0098DA] hover:bg-gray-100'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Search & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 pr-4 py-2.5 w-64 bg-white border-gray-300 rounded-xl focus:border-[#0098DA] focus:ring-2 focus:ring-[#0098DA]/20 transition-all"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar_url || ''} alt={user?.nome || 'User'} />
                    <AvatarFallback className="bg-[#0098DA] text-white font-medium">
                      {user?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-800">{user?.nome || 'Usuário'}</p>
                    <p className="text-xs leading-none text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        isActive(item.href) 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavigation;