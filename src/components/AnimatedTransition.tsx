
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedTransition = ({ 
  children, 
  className,
  delay = 0
}: AnimatedTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1],
        delay: delay * 0.1 
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const AnimatedList = ({ 
  children, 
  staggerDelay = 0.05,
  className 
}: AnimatedListProps) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.16, 1, 0.3, 1],
            delay: index * staggerDelay 
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedTransition;
