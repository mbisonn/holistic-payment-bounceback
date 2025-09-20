
import { ShieldCheck, Lock, GiftIcon, Check } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const TrustBadges = () => {
  const trustBadgeVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, delay: 0.6 }
    }
  };

  return (
    <motion.div 
      className="mt-12"
      variants={trustBadgeVariants}
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <h3 className="font-medium text-center mb-6 text-green-800 text-lg">Why Choose Tenera Holistic & Wellness</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rounded-full bg-white p-3 shadow-sm">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-green-800">Premium Quality</p>
              <p className="text-sm text-gray-600">100% natural products</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rounded-full bg-white p-3 shadow-sm">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-green-800">Secured Payments</p>
              <p className="text-sm text-gray-600">SSL encrypted checkout</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rounded-full bg-white p-3 shadow-sm">
              <GiftIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-green-800">Exclusive Benefits</p>
              <p className="text-sm text-gray-600">Special offers for members</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-8 text-center secure-badge"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 rounded-full border border-green-200 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Trusted By Thousands Of Customers</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrustBadges;
