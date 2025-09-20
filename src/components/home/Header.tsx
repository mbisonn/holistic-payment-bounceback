import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <motion.header 
      className="relative z-20 p-6 bg-black/20 backdrop-blur-sm border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-0">
        {/* Row: logo, H1/H2, admin button for desktop; stacked for mobile */}
        <div className="flex flex-col md:flex-row items-center w-full">
          <div className="flex items-center justify-center w-full md:w-auto">
            <AnimatedLogo />
          </div>
          <div className="flex md:flex-row flex-col w-full md:w-auto md:items-center md:ml-4 mt-4 md:mt-0">
            <div className="flex flex-col w-full md:w-auto text-center md:text-left items-center md:items-start">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold md:bg-gradient-to-r md:from-green-400 md:via-emerald-500 md:to-green-600 md:bg-clip-text md:text-transparent md:mb-0 mb-1 leading-tight md:leading-none text-center md:text-left">
                Bounce back to life Consult
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl leading-snug md:leading-normal text-center md:text-left">
                Natural Solutions for Your Wellness
              </p>
            </div>
            {/* Admin button for mobile, below logo and text */}
            <div className="flex md:hidden w-full mt-4">
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm w-full"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
        {/* Admin button for desktop */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden md:flex"
        >
          <Button
            onClick={handleAdminLogin}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
