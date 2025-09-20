
import React from 'react';
import { motion } from 'framer-motion';

const GlassPrismBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated background shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${100 + Math.random() * 200}px`,
            height: `${100 + Math.random() * 200}px`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10"
            style={{
              clipPath: `polygon(${Math.random() * 30}% 0%, 100% ${Math.random() * 30}%, ${100 - Math.random() * 30}% 100%, 0% ${100 - Math.random() * 30}%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default GlassPrismBackground;
