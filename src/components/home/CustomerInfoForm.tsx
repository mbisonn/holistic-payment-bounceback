import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { itemVariants } from '@/utils/animationVariants';

// Nigerian states array
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  lga: string;
  state: string;
  country: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInfoChange: (field: string, value: string) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ customerInfo, onInfoChange }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="shadow-2xl border-0 bg-black/20 backdrop-blur-xl border border-white/10">
        <CardHeader className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white backdrop-blur-sm">
          <CardTitle className="flex items-center gap-3 text-3xl font-black">
            <User className="h-10 w-10" />
            CUSTOMER DETAILS
          </CardTitle>
          <CardDescription className="text-blue-100 text-xl">
            Secure information collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label htmlFor="firstName" className="flex items-center gap-2 text-lg font-bold text-white">
                <User className="h-5 w-5 text-blue-400" />
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={customerInfo.firstName}
                onChange={(e) => onInfoChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
                required
              />
            </motion.div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label htmlFor="lastName" className="text-lg font-bold text-white">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={customerInfo.lastName}
                onChange={(e) => onInfoChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
                required
              />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Label htmlFor="email" className="flex items-center gap-2 text-lg font-bold text-white">
              <Mail className="h-5 w-5 text-blue-400" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={customerInfo.email}
              onChange={(e) => onInfoChange('email', e.target.value)}
              placeholder="Enter your email address"
              className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Label htmlFor="phone" className="flex items-center gap-2 text-lg font-bold text-white">
              <Phone className="h-5 w-5 text-blue-400" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={customerInfo.phone}
              onChange={(e) => onInfoChange('phone', e.target.value)}
              placeholder="+234 801 234 5678"
              className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Label htmlFor="street" className="flex items-center gap-2 text-lg font-bold text-white">
              <MapPin className="h-5 w-5 text-blue-400" />
              Street Address
            </Label>
            <Input
              id="street"
              name="street"
              autoComplete="street-address"
              value={customerInfo.street}
              onChange={(e) => onInfoChange('street', e.target.value)}
              placeholder="Enter your street address"
              className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
              required
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <Label htmlFor="lga" className="text-lg font-bold text-white">Local Government Area</Label>
              <Input
                id="lga"
                name="lga"
                autoComplete="address-level2"
                value={customerInfo.lga}
                onChange={(e) => onInfoChange('lga', e.target.value)}
                placeholder="Enter your LGA"
                className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
                required
              />
            </motion.div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Label htmlFor="state" className="text-lg font-bold text-white">State</Label>
              <Select value={customerInfo.state} onValueChange={(value) => onInfoChange('state', value)}>
                <SelectTrigger aria-labelledby="state" className="h-14 text-lg bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 backdrop-blur-sm">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                  {nigerianStates.map((state) => (
                    <SelectItem key={state} value={state} className="text-white hover:bg-white/10">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <Label htmlFor="country" className="text-lg font-bold text-white">Country</Label>
            <Input
              id="country"
              name="country"
              autoComplete="country-name"
              value={customerInfo.country}
              disabled
              className="h-14 text-lg bg-white/5 border-2 border-white/10 text-gray-400 backdrop-blur-sm"
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerInfoForm;
