import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
}

export const BlurText: React.FC<BlurTextProps> = ({ text, className = '' }) => {
  const words = text.split(' ');

  return (
    <h1
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '0.15em',
      }}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 40 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2 + idx * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: 'inline-block',
            marginRight: '0.28em',
          }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};
