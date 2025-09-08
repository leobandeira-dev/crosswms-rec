
import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass()}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
