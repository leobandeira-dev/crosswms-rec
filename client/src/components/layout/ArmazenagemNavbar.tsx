import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle, 
  Target, 
  ClipboardList,
  ArrowLeft
} from 'lucide-react';

const ArmazenagemNavbar = () => {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      path: '/armazenagem',
      label: 'Dashboard',
      icon: BarChart3,
      number: '1'
    },
    {
      path: '/armazenagem/conferencia',
      label: 'Conferência',
      icon: CheckCircle,
      number: '2'
    },
    {
      path: '/armazenagem/enderecamento',
      label: 'Endereçamento',
      icon: Target,
      number: '3'
    },
    {
      path: '/armazenagem/checklist',
      label: 'Checklist',
      icon: ClipboardList,
      number: '4'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/armazenagem') {
      return location === '/armazenagem';
    }
    return location.startsWith(path);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => setLocation(item.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${active 
                        ? 'bg-orange-100 text-orange-600 border-b-2 border-orange-500' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${active 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {item.number}
                    </div>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Gestão Logística
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArmazenagemNavbar;