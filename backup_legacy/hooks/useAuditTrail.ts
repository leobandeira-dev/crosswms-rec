
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';

export type AuditEntry = {
  id: string;
  timestamp: Date;
  username: string;
  action: string;
  details?: string;
};

export const useAuditTrail = (moduleId: string, entityId?: string) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  // Fetch audit data for the specific module
  useEffect(() => {
    const fetchAuditData = async () => {
      setLoading(true);
      try {
        // This is a mock implementation
        // In a real application, you would fetch data from your backend
        // Example: const { data, error } = await supabase.from('audit_logs').select('*').eq('module_id', moduleId);
        
        // For now, we'll use mock data
        const mockData: AuditEntry[] = [
          {
            id: uuidv4(),
            timestamp: new Date(2025, 4, 15, 10, 30),
            username: 'admin.user',
            action: 'Cancelamento de Unitização',
            details: 'Cancelou unitização do palete PAL-2023-001'
          },
          {
            id: uuidv4(),
            timestamp: new Date(2025, 4, 14, 15, 45),
            username: 'joão.silva',
            action: 'Visualização de Detalhes',
            details: 'Consultou detalhes do palete PAL-2023-002'
          },
          {
            id: uuidv4(),
            timestamp: new Date(2025, 4, 13, 9, 15),
            username: 'maria.oliveira',
            action: 'Busca de Palete',
            details: 'Buscou palete por ID: PAL-2023-003'
          }
        ];
        
        setAuditEntries(mockData);
      } catch (error) {
        console.error('Error fetching audit data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditData();
  }, [moduleId, entityId]);
  
  // Function to add a new audit entry
  const addAuditEntry = (action: string, details?: string) => {
    const newEntry: AuditEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      username: user?.email || 'system',
      action,
      details
    };
    
    setAuditEntries((prev) => [newEntry, ...prev]);
    
    // In a real application, you would also save this to your backend
    // Example: await supabase.from('audit_logs').insert([newEntry]);
  };
  
  return {
    auditEntries,
    loading,
    addAuditEntry
  };
};
