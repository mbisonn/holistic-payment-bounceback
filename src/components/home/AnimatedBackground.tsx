
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const bubbleVariants = {
    animate: {
      y: [-20, -100, -20],
      x: [-10, 10, -10],
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const floatingBubbleVariants = {
    animate: {
      y: [0, -50, 0],
      x: [0, 20, 0],
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.7, 0.2],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <>
      {/* Bubbles background: always visible, non-interactive, lowest z-index */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large floating bubble orbs */}
        <motion.div 
          variants={bubbleVariants} 
          animate="animate" 
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl" 
        />
        <motion.div 
          variants={bubbleVariants} 
          animate="animate" 
          className="absolute top-40 right-20 w-52 h-52 bg-gradient-to-r from-blue-500/25 to-cyan-500/25 rounded-full blur-3xl" 
          style={{ animationDelay: "3s" }} 
        />
        <motion.div 
          variants={bubbleVariants} 
          animate="animate" 
          className="absolute bottom-32 left-1/4 w-48 h-48 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl" 
          style={{ animationDelay: "6s" }} 
        />
        <motion.div 
          variants={bubbleVariants} 
          animate="animate" 
          className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-r from-orange-500/25 to-red-500/25 rounded-full blur-2xl" 
          style={{ animationDelay: "9s" }} 
        />

        {/* Smaller floating bubbles */}
        <motion.div 
          variants={floatingBubbleVariants} 
          animate="animate" 
          className="absolute top-1/4 left-3/4 w-24 h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" 
        />
        <motion.div 
          variants={floatingBubbleVariants} 
          animate="animate" 
          className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-teal-500/25 to-blue-500/25 rounded-full blur-xl" 
          style={{ animationDelay: "2s" }} 
        />

        {/* Additional small bubbles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-gradient-to-r from-white/10 to-white/20 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [0.5, 1, 0.5],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut" as const
            }}
          />
        ))}

        {/* Medium bubbles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`medium-${i}`}
            className="absolute w-16 h-16 bg-gradient-to-r from-yellow-300/15 to-orange-300/15 rounded-full blur-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 25, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut" as const
            }}
          />
        ))}
      </div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(147,_51,_234,_0.1)_60deg,_transparent_120deg,_rgba(59,_130,_246,_0.1)_180deg,_transparent_240deg,_rgba(16,_185,_129,_0.1)_300deg,_transparent_360deg)]" />
    </>
  );
};

export default AnimatedBackground;
