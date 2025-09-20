
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscountCode } from '@/types/product-types';
import { discountCodes } from '@/utils/discountUtils';
import { useToast } from '@/hooks/use-toast';
import { BadgePercent, DollarSign, TagIcon, Trash2, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DiscountCodesPage = () => {
  const [codes, setCodes] = useState<Record<string, DiscountCode>>(discountCodes);
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Try to load codes from localStorage
    const savedCodes = localStorage.getItem('discountCodes');
    if (savedCodes) {
      try {
        setCodes(JSON.parse(savedCodes));
      } catch (e) {
        console.error("Error parsing saved discount codes:", e);
      }
    }
  }, []);

  // Save codes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('discountCodes', JSON.stringify(codes));
  }, [codes]);

  const handleAddCode = () => {
    if (!newCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    if (discountValue <= 0) {
      toast({
        title: "Error",
        description: "Discount value must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    const formattedCode = newCode.toUpperCase();
    
    if (codes[formattedCode]) {
      toast({
        title: "Error",
        description: "This code already exists",
        variant: "destructive",
      });
      return;
    }

    const newDiscountCode: DiscountCode = {
      code: formattedCode,
      type: discountType,
      value: discountValue,
      max_uses: 100,
      current_uses: 0,
      used: false
    };

    setCodes(prev => ({
      ...prev,
      [formattedCode]: newDiscountCode
    }));

    toast({
      title: "Success",
      description: `Discount code '${formattedCode}' has been created`,
      variant: "default",
    });

    setNewCode('');
    setDiscountValue(0);
  };

  const handleReset = (code: string) => {
    setCodes(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        used: false
      }
    }));

    toast({
      title: "Success",
      description: `Discount code '${code}' has been reset and can be used again`,
      variant: "default",
    });
  };

  const handleDelete = (code: string) => {
    const newCodes = { ...codes };
    delete newCodes[code];
    setCodes(newCodes);

    toast({
      title: "Success",
      description: `Discount code '${code}' has been deleted`,
      variant: "default",
    });
  };

  const handleExportCodes = () => {
    setIsLoading(true);
    // Convert codes object to CSV format
    const headers = ["Code", "Type", "Value", "Status"];
    const rows = Object.values(codes).map(code => [
      code.code,
      code.type,
      code.value,
      code.used ? 'Used' : 'Active'
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `discount_codes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsLoading(false);
    
    toast({
      title: "Export Successful",
      description: "Discount codes have been exported to CSV",
      variant: "default",
    });
  };

  const handleImportCodes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split("\n");
        
        // Skip header row
        const newCodes: Record<string, DiscountCode> = {};
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const [code, type, value, status] = lines[i].split(",");
          if (code && type && value) {
            newCodes[code] = {
              code,
              type: type as 'percentage' | 'fixed_amount',
              value: Number(value),
              max_uses: 100,
              current_uses: 0,
              used: status?.trim().toLowerCase() === 'used'
            };
          }
        }
        
        // Update codes state
        setCodes(prev => ({
          ...prev,
          ...newCodes
        }));
        
        toast({
          title: "Import Successful",
          description: `Imported ${Object.keys(newCodes).length} discount codes`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error importing CSV:", error);
        toast({
          title: "Import Failed",
          description: "Failed to import discount codes. Please check the CSV format.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        e.target.value = ''; // Reset input
      }
    };
    
    reader.readAsText(file);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-green-800">Discount Codes Management</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <a href="/">Back to Checkout</a>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="text-green-600" />
              Create New Discount Code
            </CardTitle>
            <CardDescription>Add a new discount code for your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="code">Discount Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed_amount')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="value">
                  {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={discountType === 'percentage' ? "e.g., 10" : "e.g., 5000"}
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleAddCode} className="w-full bg-green-600 hover:bg-green-700">
                  Create Discount Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Discount Codes</CardTitle>
                <CardDescription>Manage your existing discount codes</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportCodes}
                  disabled={isLoading || Object.keys(codes).length === 0}
                  className="text-green-700"
                >
                  {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Export CSV
                </Button>
                
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCodes}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <Button 
                    variant="outline" 
                    disabled={isLoading} 
                    className="text-green-700"
                  >
                    {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Import CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(codes).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No discount codes available. Create one above to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(codes).map((discount) => (
                  <motion.div
                    key={discount.code}
                    variants={itemVariants}
                  >
                    <Card key={discount.code} className={`shadow-sm border ${discount.used ? 'bg-gray-50' : 'bg-white'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${discount.used ? 'bg-gray-100' : 'bg-green-100'}`}>
                              {discount.type === 'percentage' ? (
                                <BadgePercent className={discount.used ? 'text-gray-500' : 'text-green-600'} size={20} />
                              ) : (
                                <DollarSign className={discount.used ? 'text-gray-500' : 'text-green-600'} size={20} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{discount.code}</div>
                              <div className="text-sm text-gray-500">
                                {discount.type === 'percentage' ? `${discount.value}% off` : `₦${(discount.value || 0).toLocaleString()} off`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {discount.used ? (
                              <>
                                <span className="flex items-center text-sm text-gray-500">
                                  <XCircle size={16} className="mr-1" /> Used
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleReset(discount.code)}
                                >
                                  Reset
                                </Button>
                              </>
                            ) : (
                              <span className="flex items-center text-sm text-green-600">
                                <CheckCircle size={16} className="mr-1" /> Active
                              </span>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(discount.code)} 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button variant="outline" asChild>
              <a href="/" className="text-green-700">Return to Checkout</a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default DiscountCodesPage;
