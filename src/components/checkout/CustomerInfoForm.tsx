
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Truck } from 'lucide-react';
import { CustomerInfo, nigerianStates } from '@/utils/productUtils';

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStateChange: (value: string) => void;
  isAdmin?: boolean;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ 
  customerInfo, 
  handleChange, 
  handleStateChange,
  isAdmin = false
}) => {
  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Truck size={24} className="text-green-600" />
            <span>Shipping Information</span>
          </CardTitle>
          <CardDescription className="text-green-700">Enter your shipping details for quick delivery of your wellness products</CardDescription>
        </CardHeader>
      </motion.div>
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Label htmlFor="name" className="flex items-center gap-2 text-green-800">
              <User size={16} className="text-green-600" /> 
              Full Name
            </Label>
            <Input 
              id="name" 
              name="name" 
              autoComplete="name"
              placeholder="Enter your full name" 
              value={customerInfo.name} 
              onChange={handleChange}
              className="border-green-200 focus:border-green-400 focus:ring-green-300"
              required
            />
          </motion.div>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Label htmlFor="email" className="flex items-center gap-2 text-green-800">
              <Mail size={16} className="text-green-600" />
              Email Address
            </Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email"
              placeholder="Enter your email" 
              value={customerInfo.email} 
              onChange={handleChange}
              className="border-green-200 focus:border-green-400 focus:ring-green-300"
              required
            />
          </motion.div>
        </div>
        
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Label htmlFor="phone" className="flex items-center gap-2 text-green-800">
            <Phone size={16} className="text-green-600" /> 
            Phone Number
          </Label>
          <Input 
            id="phone" 
            name="phone" 
            autoComplete="tel"
            placeholder="Enter your phone number" 
            value={customerInfo.phone} 
            onChange={handleChange}
            className="border-green-200 focus:border-green-400 focus:ring-green-300"
            required
          />
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Label htmlFor="address" className="flex items-center gap-2 text-green-800">
            <MapPin size={16} className="text-green-600" />
            Delivery Address
          </Label>
          <Input 
            id="address" 
            name="address" 
            autoComplete="street-address"
            placeholder="Enter your street address" 
            value={customerInfo.address} 
            onChange={handleChange}
            className="border-green-200 focus:border-green-400 focus:ring-green-300"
            required
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Label htmlFor="city" className="flex items-center gap-2 text-green-800">
              <MapPin size={16} className="text-green-600" />
              Local Government Area (LGA)
            </Label>
            <Input 
              id="city" 
              name="city" 
              autoComplete="address-level2"
              placeholder="Enter your LGA" 
              value={customerInfo.city} 
              onChange={handleChange}
              className="border-green-200 focus:border-green-400 focus:ring-green-300"
              required
            />
          </motion.div>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Label htmlFor="state" className="flex items-center gap-2 text-green-800">
              <MapPin size={16} className="text-green-600" />
              State
            </Label>
            <Select 
              value={customerInfo.state} 
              onValueChange={handleStateChange}
            >
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-300">
                <SelectValue placeholder="Select State" />
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

        {isAdmin && (
          <div className="flex justify-end">
            <Button asChild variant="outline" className="text-green-700">
              <a href="/admin/" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/'; }}>Manage Discount Codes</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerInfoForm;
