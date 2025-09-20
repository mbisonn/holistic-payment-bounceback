
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createAnimationVariant } from '@/utils/animationVariants';
import { withTimeout, startLoadingGuard } from '@/utils/asyncGuards';

interface CustomerTag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const CustomerTags = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomerTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
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
    fetchTags();
  }, []);

  const fetchTags = async () => {
    // Ensure UI never hangs on loading spinner
    const stopGuard = startLoadingGuard(setLoading, 10000);
    try {
      const res = await withTimeout(
        supabase
          .from('customer_tags')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as PromiseLike<any>,
        8000
      ) as any;
      const { data, error } = res ?? {};
      if (error) throw error;
      // Transform the data to include updated_at field with fallback
      const transformedData = (data || []).map((tag: any) => ({
        ...tag,
        updated_at: tag.updated_at || tag.created_at
      }));
      setTags(transformedData);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer tags",
        variant: "destructive"
      });
      setTags([]);
    } finally {
      try { stopGuard(); } catch {}
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        const { error } = await supabase
          .from('customer_tags')
          .update({
            name: formData.name,
            color: formData.color,
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTag.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tag updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('customer_tags')
          .insert({
            name: formData.name,
            color: formData.color,
            description: formData.description || null
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tag created successfully"
        });
      }
      
      fetchTags();
      resetForm();
      setIsCreateDialogOpen(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: "Error",
        description: "Failed to save tag",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      const { error } = await supabase
        .from('customer_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Tag deleted successfully"
      });
      
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      description: ''
    });
  };

  const handleEdit = (tag: CustomerTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || '#3B82F6',
      description: tag.description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Tags</h1>
          <p className="text-gray-600">Organize and categorize your customers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingTag(null);
                    resetForm();
                  }}
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
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: tag.color || '#3B82F6' }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    Tag
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tag.description && (
                    <p className="text-sm text-gray-600">{tag.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(tag.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tag)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(tag.id)}
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

      {filteredTags.length === 0 && (
        <div className="text-center py-8">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tags found</p>
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

export default CustomerTags;
