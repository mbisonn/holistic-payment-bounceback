import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Mail, Phone, MapPin, ShoppingBag, DollarSign, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddCustomerDialog } from '@/components/admin/customers/AddCustomerDialog';
interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}
interface CustomerTag {
  id: string;
  name: string;
  color: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string;
}
interface TagAssignment {
  id: string;
  customer_email: string;
  customer_name?: string;
  tag_id: string | null;
  created_at: string;
  assigned_at?: string;
}

const CustomersManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const [allTags, setAllTags] = useState<CustomerTag[]>([]);
  const [tagAssignments, setTagAssignments] = useState<Record<string, TagAssignment[]>>({});
  const [tagDialogOpen, setTagDialogOpen] = useState<string | null>(null); // customer email
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDialogLoading, setTagDialogLoading] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch all tags and tag assignments on mount
  useEffect(() => {
    // Fire-and-forget; do not block initial render
    setLoading(true);
    Promise.allSettled([
      fetchCustomers(),
      fetchAllTags(),
      fetchAllTagAssignments(),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [customers, searchTerm]);

  // Calculate pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const fetchCustomers = async () => {
    try {
      // Prefer using orders table data over non-existent customers table
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('customer_name, customer_email, total_amount, created_at');
      if (fetchError) throw fetchError;

      const customerMap = new Map<string, Customer>();
      orders?.forEach((order: { 
        customer_email: string; 
        customer_name?: string | null; 
        total_amount: number; 
        created_at: string | null;
      }) => {
        const email = order.customer_email;
        if (!email) return;
        if (customerMap.has(email)) {
          const customer = customerMap.get(email)!;
          customer.totalOrders += 1;
          customer.totalSpent += order.total_amount;
          if (!customer.lastOrderDate || (order.created_at && new Date(order.created_at) > new Date(customer.lastOrderDate))) {
            customer.lastOrderDate = order.created_at || customer.lastOrderDate;
          }
        } else {
          customerMap.set(email, {
            id: email,
            email: email,
            name: order.customer_name || 'Unknown',
            phone: undefined,
            address: undefined,
            totalOrders: 1,
            totalSpent: order.total_amount,
            lastOrderDate: order.created_at || new Date().toISOString()
          });
        }
      });
      setCustomers(Array.from(customerMap.values()));
    } catch (error: any) {
      // Non-fatal: log, keep UI with empty list
      console.warn('Error fetching customers:', error);
      setError(error.message || 'Failed to fetch customers');
      setCustomers([]);
      toast({ title: 'Customers', description: error.message || 'Failed to fetch customers', variant: 'destructive' });
    } finally {
      // do not block UI on loading here
    }
  };

  const fetchAllTags = async () => {
    try {
      const { data, error } = await supabase.from('customer_tags').select('*');
      if (error) throw error;
      setAllTags((data || []).map((t: any) => ({ 
        id: t.id, 
        name: t.name, 
        color: t.color || '#3B82F6',
        description: t.description || '',
        created_at: t.created_at || new Date().toISOString() 
      })));
    } catch (e) {
      console.warn('Failed to fetch tags:', e);
      setAllTags([]);
    }
  };

  const fetchAllTagAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_tag_assignments')
        .select('*');
      if (error) throw error;
      
      // Group assignments by customer email
      const assignments: Record<string, TagAssignment[]> = {};
      (data || []).forEach((assignment: any) => {
        if (!assignments[assignment.customer_email]) {
          assignments[assignment.customer_email] = [];
        }
        assignments[assignment.customer_email].push(assignment);
      });
      setTagAssignments(assignments);
    } catch (e) {
      console.warn('Failed to fetch tag assignments:', e);
      setTagAssignments({});
    }
  };

  const openTagDialog = (customer: Customer) => {
    setTagDialogOpen(customer.email);
    // Set selected tags for this customer
    const assignments = tagAssignments[customer.email] || [];
    setSelectedTags(assignments.map(a => a.tag_id!).filter(Boolean));
  };

  const handleTagChange = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };
  const saveCustomerTags = async (customer: Customer) => {
    setTagDialogLoading(true);
    try {
      // Remove existing assignments for this customer
      await supabase
        .from('customer_tag_assignments')
        .delete()
        .eq('customer_email', customer.email);

      // Add new assignments
      if (selectedTags.length > 0) {
        const assignments = selectedTags.map(tagId => ({
          customer_email: customer.email,
          customer_name: customer.name,
          tag_id: tagId
        }));

        const { error } = await supabase
          .from('customer_tag_assignments')
          .insert(assignments);

        if (error) throw error;
      }
      
      // Refresh tag assignments
      await fetchAllTagAssignments();
      
      toast({
        title: 'Tags updated',
        description: `Tags updated for ${customer.name}`
      });
      setTagDialogOpen(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setTagDialogLoading(false);
    }
  };
  // Non-blocking inline error banner
  const errorBanner = error ? (
    <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
      {error}
      <Button size="sm" variant="outline" className="ml-2 glass-button-outline" onClick={() => { setError(null); fetchCustomers(); fetchAllTags(); fetchAllTagAssignments(); }}>Retry</Button>
    </div>
  ) : null;
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-gray-300">Manage and view customer information</p>
        </div>
        <Button 
          className="w-full sm:w-auto mt-2 sm:mt-0 glass-button"
          onClick={() => setAddCustomerOpen(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
      {/* Inline error (non-blocking) */}
      {errorBanner}

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 glass-input text-white border-white/20" />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card overflow-hidden border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-lime-500">
            <CardTitle className="text-sm font-medium text-white">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="bg-gray-800">
            <div className="text-2xl font-bold text-white">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card overflow-hidden border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-lime-500">
            <CardTitle className="text-sm font-medium text-white">Avg Orders per Customer</CardTitle>
            <ShoppingBag className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="bg-gray-800">
            <div className="text-2xl font-bold text-white">
              {customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card overflow-hidden border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-lime-500">
            <CardTitle className="text-sm font-medium text-white">Avg Customer Value</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="bg-gray-800">
            <div className="text-2xl font-bold text-white">
              ₦{customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Customers Table */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium text-white">Customer</th>
                  <th className="text-left p-4 font-medium text-white">Contact</th>
                  <th className="text-left p-4 font-medium text-white">Orders</th>
                  <th className="text-left p-4 font-medium text-white">Total Spent</th>
                  <th className="text-left p-4 font-medium text-white">Last Order</th>
                  <th className="text-left p-4 font-medium text-white">Date of Purchase</th>
                  <th className="text-left p-4 font-medium text-white">Tags</th>
                  <th className="text-left p-4 font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer, index) => <motion.tr key={customer.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.05
              }} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white/70" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-gray-300">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="w-4 h-4 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && <div className="flex items-center text-sm text-gray-300">
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </div>}
                        {customer.address && <div className="flex items-center text-sm text-gray-300">
                            <MapPin className="w-4 h-4 mr-1" />
                            {customer.address}
                          </div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-white">{customer.totalOrders}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-green-400">
                        ₦{customer.totalSpent.toLocaleString()}
                      </span>
                    </td>
                     <td className="p-4">
                      {customer.lastOrderDate ? <span className="text-sm text-gray-300">
                          {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </span> : <span className="text-sm text-gray-400">Never</span>}
                    </td>
                    <td className="p-4">
                      {customer.lastOrderDate ? <span className="text-sm text-gray-300">
                          {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </span> : <span className="text-sm text-gray-400">No purchases</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(tagAssignments[customer.email] || []).map(assignment => {
                      const tag = allTags.find(t => t.id === assignment.tag_id);
                      if (!tag) return null;
                      return <Badge key={tag.id} style={{
                        backgroundColor: tag.color || '#3B82F6',
                        color: '#fff'
                      }}>
                              {tag.name}
                            </Badge>;
                    })}
                        {(tagAssignments[customer.email] || []).length === 0 && <span className="text-xs text-gray-400">No tags</span>}
                      </div>
                      <Dialog open={tagDialogOpen === customer.email} onOpenChange={open => setTagDialogOpen(open ? customer.email : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => openTagDialog(customer)} className="glass-button-outline">
                            <Tag className="h-4 w-4 mr-1" /> Edit Tags
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card glass-modal animate-fade-in w-[100vw] h-[100vh] max-w-none max-h-none p-4 sm:max-w-md sm:h-auto">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Tags for {customer.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto sm:max-h-none">
                            {allTags.length === 0 ? (
                              <div className="text-gray-400">No tags available.</div>
                            ) : (
                              allTags.map(tag => (
                                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => handleTagChange(tag.id)} className="accent-blue-600" />
                                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: tag.color || '#3B82F6', color: '#fff' }}>{tag.name}</span>
                                  <span className="text-xs text-gray-400">{tag.description}</span>
                                </label>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2 pt-4 justify-end">
                            <Button variant="outline" onClick={() => setTagDialogOpen(null)} disabled={tagDialogLoading} className="glass-button-outline">Cancel</Button>
                            <Button onClick={() => saveCustomerTags(customer)} disabled={tagDialogLoading} className="glass-button">{tagDialogLoading ? 'Saving...' : 'Save'}</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="p-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="glass-button-outline"
                        onClick={() => viewCustomerDetails(customer)}
                      >
                        View Details
                      </Button>
                    </td>
                  </motion.tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="glass-button-outline"
          >
            Previous
          </Button>
          <span className="text-white px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="glass-button-outline"
          >
            Next
          </Button>
        </div>
      )}

      {filteredCustomers.length === 0 && !loading && <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No customers found</p>
        </div>}

      <AddCustomerDialog 
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onCustomerAdded={fetchCustomers}
      />

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="glass-card glass-modal max-w-2xl animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-white">Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Name</h4>
                  <p className="text-white">{selectedCustomer.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Email</h4>
                  <p className="text-white">{selectedCustomer.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Phone</h4>
                  <p className="text-white">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Total Orders</h4>
                  <p className="text-white">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Total Spent</h4>
                  <p className="text-white">₦{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Last Order</h4>
                  <p className="text-white">
                    {selectedCustomer.lastOrderDate 
                      ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString()
                      : 'No orders'
                    }
                  </p>
                </div>
              </div>
              
              {selectedCustomer.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Address</h4>
                  <p className="text-white">{selectedCustomer.address}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(tagAssignments[selectedCustomer.email] || []).map(assignment => {
                    const tag = allTags.find(t => t.id === assignment.tag_id);
                    if (!tag) return null;
                    return (
                      <span 
                        key={tag.id}
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: tag.color || '#3B82F6', color: '#fff' }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                  {(tagAssignments[selectedCustomer.email] || []).length === 0 && (
                    <span className="text-gray-400 text-sm">No tags assigned</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsDialog(false)}
                className="glass-button-outline"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>;
};
export default CustomersManagement;