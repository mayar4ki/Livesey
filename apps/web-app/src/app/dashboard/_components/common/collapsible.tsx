'use client';

import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface CollapsibleProps {
  children: ReactNode;
  open: boolean;
  className?: string;
  contentClassName?: string;
}

export const Collapsible = ({ children, open, className, contentClassName }: CollapsibleProps) => {
  return (
    <div className={className}>
      <motion.div
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        style={{
          overflow: 'hidden',
        }}
      >
        <div className={contentClassName}>{children}</div>
      </motion.div>
    </div>
  );
};
