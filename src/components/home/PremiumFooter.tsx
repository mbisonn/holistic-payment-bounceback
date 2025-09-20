import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award } from 'lucide-react';

const PremiumFooter: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.5 }}
      className="relative z-10 bg-gradient-to-br from-[#3a1c71] via-[#5f2c82] to-[#1b1b3a] border-t border-white/10 mt-20"
    >
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center space-y-12">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-6">
            Secure & Trusted Payment Processing
          </h2>

          {/* Payment Methods Icons */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="bg-white/10 rounded-xl p-4 flex items-center justify-center shadow-lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-8 w-auto" />
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex items-center justify-center shadow-lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-8 w-auto" />
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex items-center justify-center shadow-lg">
              <img src="https://d1yei2z3i6k35z.cloudfront.net/8917555/68427904f1995_paystacklogo_prev_ui.png" alt="Paystack" className="h-8 w-auto" />
            </div>
          </div>
          
          {/* Trust Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center w-full max-w-5xl mb-8">
            <div className="rounded-2xl bg-white/10 p-8 flex flex-col items-center shadow-xl">
              <Shield className="h-10 w-10 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Bank-Level Security</h3>
              <p className="text-gray-200">Your data is protected with 256-bit SSL encryption and advanced fraud detection</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-8 flex flex-col items-center shadow-xl">
              <Clock className="h-10 w-10 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Instant Processing</h3>
              <p className="text-gray-200">Lightning-fast payment processing with real-time confirmations and instant receipts</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-8 flex flex-col items-center shadow-xl">
              <Award className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Trusted by Thousands</h3>
              <p className="text-gray-200">Join thousands of satisfied customers who trust our secure payment platform</p>
            </div>
          </div>
          
          {/* Copyright */}
          <motion.p
            className="text-gray-400 text-lg text-center border-t border-white/10 pt-8 w-full mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            © 2024 Bounce back to life Consult. All rights reserved. ✨
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default PremiumFooter;
