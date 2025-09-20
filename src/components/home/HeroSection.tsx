
import { motion } from 'framer-motion';
import { Shield, Award, Clock, Star } from 'lucide-react';
import { itemVariants, floatingVariants } from '@/utils/animationVariants';

const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="relative z-10 py-20 overflow-hidden"
    >
      <div className="container mx-auto px-6 relative">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200"
            style={{
              textShadow: "0 0 40px rgba(147, 51, 234, 0.5)"
            }}
          >
            PREMIUM WELLNESS
          </motion.h1>
          
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <motion.p 
              className="text-2xl md:text-3xl mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Experience the future of holistic health with cutting-edge payment technology
            </motion.p>
          </motion.div>
          
          {/* Trust Indicators with Premium Effects */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { icon: Shield, text: "Bank-Level Security", color: "from-green-400 to-emerald-600" },
              { icon: Award, text: "Premium Quality", color: "from-yellow-400 to-orange-600" },
              { icon: Clock, text: "24/7 Support", color: "from-blue-400 to-cyan-600" },
              { icon: Star, text: "5-Star Rated", color: "from-purple-400 to-pink-600" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                whileHover={{ 
                  scale: 1.1, 
                  y: -10,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className={`flex items-center gap-3 bg-gradient-to-r ${item.color} text-white rounded-2xl px-8 py-4 shadow-2xl backdrop-blur-sm border border-white/20`}
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-bold text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
