
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  date: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  company: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Mock data - in a real app this would fetch from API
    setTimeout(() => {
      setProfile({
        id: '1',
        name: 'Usuário Demonstração',
        email: 'demo@example.com',
        role: 'Administrador',
        company: 'CROSS Logistics',
        avatar: undefined
      });
      
      setNotifications([
        {
          id: '1',
          title: 'Nova solicitação de coleta',
          message: 'Uma nova solicitação de coleta foi registrada e aguarda aprovação.',
          type: 'info',
          read: false,
          date: new Date()
        },
        {
          id: '2',
          title: 'Erro no carregamento',
          message: 'Houve um erro no carregamento da ordem #12345.',
          type: 'error',
          read: false,
          date: new Date(Date.now() - 3600000)
        },
        {
          id: '3',
          title: 'Faturamento gerado',
          message: 'O faturamento do mês foi gerado com sucesso.',
          type: 'success',
          read: true,
          date: new Date(Date.now() - 86400000)
        }
      ]);
      
      setIsLoading(false);
    }, 500);
  }, []);
  
  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(note => 
      note.id === notificationId ? { ...note, read: true } : note
    ));
    
    toast({
      title: "Notificação marcada como lida",
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(note => ({ ...note, read: true })));
    
    toast({
      title: "Todas notificações marcadas como lidas",
    });
  };
  
  const clearNotifications = () => {
    setNotifications([]);
    
    toast({
      title: "Notificações removidas",
    });
  };
  
  const logout = () => {
    // In a real app, this would make an API call to logout
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    
    // Redirect to login page or landing page in a real app
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };
  
  return {
    profile,
    isLoading,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    logout
  };
};
