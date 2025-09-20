import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export default function CustomerTagsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomerTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['customer-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_tags')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomerTag[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('customer_tags')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
      toast.success('Tag created successfully');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create tag: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('customer_tags')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
      toast.success('Tag updated successfully');
      setEditingTag(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update tag: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete tag: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (tag: CustomerTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Tags</h1>
          <p className="text-white/70 mt-2">Organize and categorize your customers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-white">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border-0"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="glass-button" disabled={createMutation.isPending}>
                  Create Tag
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-white/20 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Card key={tag.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}
                    className="border"
                  >
                    {tag.name}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(tag)}
                      className="h-8 w-8 p-0 text-white/70 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(tag.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {tag.description && (
                  <p className="text-white/70 text-sm mb-3">{tag.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Users className="w-3 h-3" />
                  <span>0 customers</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingTag && (
        <Dialog open={true} onOpenChange={() => setEditingTag(null)}>
          <DialogContent className="glass-modal">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-white">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-white">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-color" className="text-white">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="edit-color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border-0"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingTag(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="glass-button" disabled={updateMutation.isPending}>
                  Update Tag
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}