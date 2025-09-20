
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Copy, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createAnimationVariant } from '@/utils/animationVariants';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const DiscountCodes = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minimum_amount: '',
    usage_limit: '',
    is_active: true,
    expires_at: ''
  });

  const cardVariants = createAnimationVariant({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  });

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const fetchDiscountCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCodes((data || []).map(code => ({
        ...code,
        type: code.type as 'fixed' | 'percentage'
      })));
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch discount codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const codeData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null
      };

      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update({
            ...codeData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCode.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Discount code updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(codeData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Discount code created successfully"
        });
      }
      
      fetchDiscountCodes();
      resetForm();
      setIsCreateDialogOpen(false);
      setEditingCode(null);
    } catch (error) {
      console.error('Error saving discount code:', error);
      toast({
        title: "Error",
        description: "Failed to save discount code",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', codeId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Discount code deleted successfully"
      });
      
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive"
      });
    }
  };

  const toggleCodeStatus = async (code: DiscountCode) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ 
          is_active: !code.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', code.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Discount code ${!code.is_active ? 'activated' : 'deactivated'}`
      });
      
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error updating discount code:', error);
      toast({
        title: "Error",
        description: "Failed to update discount code",
        variant: "destructive"
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Discount code copied to clipboard"
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minimum_amount: '',
      usage_limit: '',
      is_active: true,
      expires_at: ''
    });
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      minimum_amount: code.minimum_amount?.toString() || '',
      usage_limit: code.usage_limit?.toString() || '',
      is_active: code.is_active,
      expires_at: code.expires_at ? code.expires_at.split('T')[0] : ''
    });
    setIsCreateDialogOpen(true);
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-600">Create and manage promotional discount codes</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card glass-modal max-w-md animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCode ? 'Edit Discount Code' : 'Create New Discount Code'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-white">Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter code"
                    required
                    className="glass-input text-white border-white/20"
                  />
                  <Button type="button" variant="outline" onClick={generateCode} className="glass-button-outline">
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="type" className="text-white">Discount Type</Label>
                <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="glass-input border-white/20 text-white">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="value" className="text-white">
                  {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.type === 'percentage' ? '10' : '1000'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  required
                  className="glass-input text-white border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="minimum_amount" className="text-white">Minimum Order Amount (₦)</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                  placeholder="Optional minimum amount"
                  min="0"
                  className="glass-input text-white border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="usage_limit" className="text-white">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Optional usage limit"
                  min="1"
                  className="glass-input text-white border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at" className="text-white">Expiry Date</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="glass-input text-white border-white/20"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-white">Active</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 glass-button">
                  {editingCode ? 'Update Code' : 'Create Code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCode(null);
                    resetForm();
                  }}
                  className="glass-button-outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search discount codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCodes.map((code, index) => (
          <motion.div
            key={code.id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-lg font-mono">{code.code}</CardTitle>
                  </div>
                  <Badge variant={code.is_active ? "default" : "secondary"}>
                    {code.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="font-semibold">
                      {code.type === 'percentage' ? `${code.value}%` : `₦${(code.value || 0).toLocaleString()}`}
                    </span>
                  </div>
                  
                  {code.minimum_amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min Amount:</span>
                      <span>₦{(code.minimum_amount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Used:</span>
                    <span>
                      {code.used_count}{code.usage_limit ? `/${code.usage_limit}` : ''}
                    </span>
                  </div>
                  
                  {code.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires:</span>
                      <span className="text-sm">
                        {new Date(code.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(code.code)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(code)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={code.is_active ? "secondary" : "default"}
                      onClick={() => toggleCodeStatus(code)}
                    >
                      {code.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(code.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-8">
          <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No discount codes found</p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscountCodes;
