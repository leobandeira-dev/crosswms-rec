import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'table' | 'chart';
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'text',
  lines = 3
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (variant === 'text') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 bg-gray-200 rounded-md relative overflow-hidden",
              index === lines - 1 && "w-3/4"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("border rounded-lg p-6 space-y-4", className)}>
        {/* Header */}
        <div className="h-6 bg-gray-200 rounded-md w-1/3 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-4 bg-gray-200 rounded-md w-4/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="h-8 bg-gray-200 rounded-md w-1/4 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="w-12 h-12 bg-gray-200 rounded-full relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded-md relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-3 bg-gray-200 rounded-md w-3/4 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Header */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded-md relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
              />
            </div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 rounded-md relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: `${(rowIndex + colIndex) * 0.1}s` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Chart bars */}
        <div className="flex items-end space-x-2 h-32">
          {Array.from({ length: 7 }).map((_, index) => {
            const height = Math.random() * 80 + 20;
            return (
              <div
                key={index}
                className="bg-gray-200 rounded-t-md flex-1 relative overflow-hidden"
                style={{ height: `${height}%` }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              </div>
            );
          })}
        </div>
        
        {/* Chart labels */}
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-3 w-8 bg-gray-200 rounded-md relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;