
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo: React.FC = () => {
  return (
    <div className="flex justify-center">
      <motion.div
        className="relative w-16 h-16 md:w-20 md:h-20"
        style={{
          perspective: "200px",
          transformStyle: "preserve-3d"
        }}
        animate={{
          rotateY: [0, 360],
          rotateX: [0, 15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 border-2 border-green-300 shadow-2xl rounded-xl"
          style={{
            transform: "rotateX(15deg) rotateY(25deg)",
            transformStyle: "preserve-3d"
          }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)",
              "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.6), 0 0 90px rgba(34, 197, 94, 0.4)",
              "0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img
            src="/lovable-uploads/e0399505-a75a-4c2c-a074-608abde4cf7c.png"
            alt="Bounce back to life Consult"
            className="w-full h-full object-contain p-2"
          />
        </motion.div>
        
        {/* 3D cube edges effect */}
        <motion.div
          className="absolute inset-0 border-2 border-green-400/60 rounded-xl"
          style={{
            transform: "rotateX(15deg) rotateY(25deg) translateZ(-6px)",
            transformStyle: "preserve-3d"
          }}
          animate={{
            borderColor: [
              "rgba(34, 197, 94, 0.6)",
              "rgba(34, 197, 94, 0.9)",
              "rgba(34, 197, 94, 0.6)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Additional 3D depth layers */}
        <motion.div
          className="absolute inset-0 border border-green-500/40 rounded-xl"
          style={{
            transform: "rotateX(15deg) rotateY(25deg) translateZ(-3px)",
            transformStyle: "preserve-3d"
          }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;
