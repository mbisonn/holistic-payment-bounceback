import React from 'react';
import { motion } from 'framer-motion';

const HomeFooter: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full py-8 mt-16 border-t border-white/20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            © 2024 Bounce back to life Consult. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default HomeFooter;
