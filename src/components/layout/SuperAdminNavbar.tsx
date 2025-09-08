import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Users, 
  Ticket, 
  Settings,
  Home,
  ArrowLeft,
  Presentation
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminNavbar() {
  const [location] = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: location === "/admin"
    },
    {
      label: "Empresas",
      href: "/admin/empresas",
      icon: Building2,
      active: location === "/admin/empresas"
    },
    {
      label: "Pacotes",
      href: "/admin/pacotes",
      icon: Package,
      active: location === "/admin/pacotes"
    },
    {
      label: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
      active: location === "/admin/usuarios"
    },
    {
      label: "Suporte",
      href: "/admin/suporte",
      icon: Ticket,
      active: location === "/admin/suporte"
    },
    {
      label: "Configurações",
      href: "/admin/configuracoes",
      icon: Settings,
      active: location === "/admin/configuracoes"
    },
    {
      label: "Apresentação",
      href: "/admin/apresentacao-comercial",
      icon: Presentation,
      active: location === "/admin/apresentacao-comercial"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#0098DA]">
                <Home className="h-4 w-4 mr-2" />
                Sistema Principal
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-[#0098DA]">
              Super Admin
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    className={
                      item.active
                        ? "bg-[#0098DA] text-white hover:bg-[#007BB5]"
                        : "text-gray-600 hover:text-[#0098DA] hover:bg-gray-100"
                    }
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Super Admin
            </div>
            <Link href="/logout">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}