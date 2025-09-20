
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerInfoSectionProps {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    street: string;
    lga: string;
    state: string;
    country: string;
  };
  updateCustomerInfo: (field: string, value: string) => void;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customerInfo,
  updateCustomerInfo
}) => {
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT-Abuja', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl w-full overflow-hidden min-h-[700px]">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-lg" />
        
        <CardHeader className="relative z-10 pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </motion.div>
            Customer Information
          </CardTitle>
          <p className="text-white/70 text-sm md:text-base mt-2">
            Please provide your details for delivery
          </p>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-6 p-4 md:p-6">
          <div className="space-y-6">
            {/* Full Name - Full Width */}
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={(e) => updateCustomerInfo('name', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12"
                required
              />
            </motion.div>

            {/* Email - Full Width */}
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={customerInfo.email}
                onChange={(e) => updateCustomerInfo('email', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12"
                required
              />
            </motion.div>

            {/* Phone with Area Code */}
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <Label htmlFor="phone" className="text-white font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="bg-white/10 border-white/30 border rounded-md px-3 py-3 text-white backdrop-blur-sm flex items-center justify-center min-w-[80px]">
                  +234
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="xxx xxx xxxx"
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12 flex-1"
                />
              </div>
            </motion.div>

            {/* Street Address - Full Width */}
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
            >
              <Label htmlFor="street" className="text-white font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Street Address
              </Label>
              <Input
                id="street"
                type="text"
                placeholder="Enter your complete street address"
                value={customerInfo.street}
                onChange={(e) => updateCustomerInfo('street', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12"
              />
            </motion.div>

            {/* City and State in Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City/LGA */}
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.02 }}
              >
                <Label htmlFor="lga" className="text-white font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City/LGA
                </Label>
                <Input
                  id="lga"
                  type="text"
                  placeholder="Enter your city or LGA"
                  value={customerInfo.lga}
                  onChange={(e) => updateCustomerInfo('lga', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12"
                />
              </motion.div>

              {/* State */}
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.02 }}
              >
                <Label htmlFor="state" className="text-white font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  State
                </Label>
                <Select value={customerInfo.state} onValueChange={(value) => updateCustomerInfo('state', value)}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Country - Full Width */}
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <Label htmlFor="country" className="text-white font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country
              </Label>
              <Input
                id="country"
                type="text"
                value={customerInfo.country}
                onChange={(e) => updateCustomerInfo('country', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm h-12"
                readOnly
              />
            </motion.div>
          </div>

          {/* Security Badge */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-white/60 text-sm mt-8 p-4 bg-white/5 rounded-lg border border-white/10"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Lock className="h-4 w-4" />
            <span>Your information is secure and encrypted</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerInfoSection;
