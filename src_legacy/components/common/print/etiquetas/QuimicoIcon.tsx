
import React from 'react';
import { Skull } from 'lucide-react';

const QuimicoIcon: React.FC = () => {
  return (
    <div className="absolute top-3 right-3 bg-red-100 p-1 rounded-full border-2 border-red-500">
      <Skull size={64} className="text-red-600" />
    </div>
  );
};

export default QuimicoIcon;
