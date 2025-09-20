
import { motion } from 'framer-motion';
import { Shield, Zap, Star } from 'lucide-react';

const TrustBadgesSection = () => {
  return (
    <motion.div 
      initial={{ y: 60, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ delay: 1.2, duration: 1 }} 
      className="mt-20 md:mt-24 text-center"
    >
      <motion.h3 
        className="text-3xl md:text-4xl font-bold text-white mb-6" 
        whileHover={{ scale: 1.05 }}
      >
        Secure & Trusted Payment Processing
      </motion.h3>
      
      <motion.div 
        className="flex justify-center items-center gap-6 md:gap-8 mb-8 md:mb-12 flex-wrap" 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }} 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20"
        >
          <img 
            src="/lovable-uploads/560c84cc-2c82-4bcb-a5b1-beaecf5f5a94.png" 
            alt="Visa" 
            className="h-8 md:h-12 w-auto object-contain" 
          />
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: -5 }} 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20"
        >
          <img 
            src="/lovable-uploads/0ee96196-dc43-46ee-a763-7d69ee403c55.png" 
            alt="Mastercard" 
            className="h-8 md:h-12 w-auto object-contain" 
          />
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }} 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20"
        >
          <img 
            src="/lovable-uploads/4f4900b7-7e2e-445d-824b-ff5b4ab259d6.png" 
            alt="Paystack" 
            className="h-8 md:h-12 w-auto object-contain" 
          />
        </motion.div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {[
          {
            icon: Shield,
            title: "Bank-Level Security",
            desc: "Your data is protected with 256-bit SSL encryption and advanced fraud detection",
            gradient: "from-green-500 to-emerald-500"
          },
          {
            icon: Zap,
            title: "Instant Processing",
            desc: "Lightning-fast payment processing with real-time confirmations and instant receipts",
            gradient: "from-yellow-500 to-orange-500"
          },
          {
            icon: Star,
            title: "Trusted by Thousands",
            desc: "Join thousands of satisfied customers who trust our secure payment platform",
            gradient: "from-blue-500 to-purple-500"
          }
        ].map((feature, index) => (
          <motion.div 
            key={index} 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 1.6 + index * 0.2, duration: 0.8 }} 
            whileHover={{ 
              scale: 1.05, 
              y: -10, 
              transition: { duration: 0.3 } 
            }} 
            className="p-6 md:p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 group cursor-pointer"
          >
            <motion.div 
              className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:shadow-2xl transition-all duration-500`} 
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.8 }}
            >
              <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <h4 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-500">
              {feature.title}
            </h4>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-500 text-sm md:text-base">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustBadgesSection;
