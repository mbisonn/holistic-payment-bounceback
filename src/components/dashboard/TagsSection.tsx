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
// removed timeout-retry behavior
import { createAnimationVariant } from '@/utils/animationVariants';

interface CustomerTag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const REQUIRED_TAGS = [{
  name: 'Cash Purchase',
  color: '#22c55e',
  description: 'Payments made on Paystack'
}, {
  name: 'Payment on Delivery',
  color: '#f59e42',
  description: 'Chose payment on delivery option'
}, {
  name: 'Abandoned Cart',
  color: '#f43f5e',
  description: 'Filled contact form but did not purchase'
}, {
  name: 'Upsell',
  color: '#6366f1',
  description: 'Paid for upsell product on Paystack'
}, {
  name: 'Downsell',
  color: '#0ea5e9',
  description: 'Paid for downsell product on Paystack'
}, {
  name: 'Meal Plan',
  color: '#a21caf',
  description: 'Filled details in meal plan from lovable.dev'
}];

const TagsSection = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomerTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });

  const cardVariants = createAnimationVariant({
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  });

  useEffect(() => {
    // fire-and-forget; do not block render
    setLoading(true);
    fetchTags().finally(() => setLoading(false));
  }, []);

  // Pre-create required tags if they don't exist
  useEffect(() => {
    if (!loading && tags.length > 0) {
      const tagNames = tags.map(t => t.name.toLowerCase());
      const missingTags = REQUIRED_TAGS.filter(reqTag => !tagNames.includes(reqTag.name.toLowerCase()));
      if (missingTags.length > 0) {
        Promise.allSettled(
          missingTags.map(reqTag =>
            supabase.from('customer_tags').insert({
              name: reqTag.name,
              color: reqTag.color,
              description: reqTag.description
            })
          )
        ).then(() => fetchTags());
      }
    }
    // eslint-disable-next-line
  }, [loading, tags]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_tags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTags(data || []);
      setError(null);
    } catch (error: any) {
      setTags([]);
      setError(error.message || 'Failed to fetch tags');
      console.warn('Tags fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Tag name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('customer_tags')
          .update({
            name: formData.name,
            color: formData.color,
            description: formData.description
          })
          .eq('id', editingTag.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Tag updated successfully'
        });
      } else {
        // Create new tag
        const { error } = await supabase
          .from('customer_tags')
          .insert([{
            name: formData.name,
            color: formData.color,
            description: formData.description
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Tag created successfully'
        });
      }

      setIsCreateDialogOpen(false);
      setEditingTag(null);
      resetForm();
      fetchTags();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tag',
        variant: 'destructive'
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
        title: 'Success',
        description: 'Tag deleted successfully'
      });

      fetchTags();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tag',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      description: ''
    });
    setEditingTag(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Tags</h1>
          <p className="text-gray-300">Organize and categorize your customers. Tags can be attached to customers and used in automations.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="glass-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card glass-modal modal-content animate-fade-in w-[100vw] h-[100vh] max-w-none max-h-none p-4 sm:max-w-md sm:h-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto sm:max-h-none">
              <div>
                <Label htmlFor="name" className="text-white">Tag Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} 
                  placeholder="Enter tag name" 
                  required 
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => setFormData({
                    ...formData,
                    description: e.target.value
                  })} 
                  placeholder="Enter tag description" 
                  rows={3}
                  className="glass-input text-white border-white/20"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-button-outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="glass-button">
                  {loading ? 'Saving...' : (editingTag ? 'Update Tag' : 'Create Tag')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inline error (non-blocking) */}
      {error && (
        <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search tags..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="pl-10 glass-input text-white border-white/20"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No tags found</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2 glass-button-outline">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredTags.map((tag, index) => (
            <motion.div 
              key={tag.id} 
              initial="hidden" 
              animate="visible" 
              variants={cardVariants} 
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-white/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: tag.color || '#3B82F6' }}
                      />
                      <CardTitle className="text-lg text-white">{tag.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="glass-secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      Tag
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tag.description && (
                      <p className="text-sm text-gray-300">{tag.description}</p>
                    )}
                    <div className="text-xs text-gray-400">
                      Created: {new Date(tag.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(tag)} 
                        className="flex-1 glass-button-outline"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(tag.id)} 
                        className="glass-button-outline"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TagsSection;