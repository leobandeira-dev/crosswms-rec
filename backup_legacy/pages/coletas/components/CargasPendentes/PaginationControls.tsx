
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void; // Changed from onPageChange to handlePageChange
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  handlePageChange
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center mt-4">
      <div className="flex space-x-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button 
            key={i}
            variant={currentPage === i + 1 ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PaginationControls;
