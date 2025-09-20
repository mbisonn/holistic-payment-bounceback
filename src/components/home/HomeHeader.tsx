
import React from 'react';
import { motion } from 'framer-motion';

const HomeHeader: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <motion.img
            src="/lovable-uploads/e0399505-a75a-4c2c-a074-608abde4cf7c.png"
            alt="Bounce back to life Consult"
            className="h-16 md:h-20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
      </div>
    </motion.header>
  );
};

export default HomeHeader;
