import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Plus, Clock, Users, ChefHat, Utensils } from 'lucide-react';

interface MealPlan {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  calories?: number | null;
  servings?: number | null;
  prep_time?: number | null;
  cook_time?: number | null;
  ingredients?: string[] | null;
  instructions?: string | null;
  is_active: boolean | null;
  created_at: string;
}

export default function MealPlan() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MealPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  useEffect(() => {
    filterMealPlans();
  }, [mealPlans, searchTerm, selectedCategory]);

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to fetch meal plans');
    } finally {
      setLoading(false);
    }
  };

  const filterMealPlans = () => {
    let filtered = [...mealPlans];

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plan => plan.category === selectedCategory);
    }

    setFilteredPlans(filtered);
  };

  const categories = Array.from(new Set(mealPlans.map(p => p.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-green-600" />
              Afro Wellness Meal Plans
            </h1>
            <p className="text-gray-600 mt-2">Discover healthy and delicious African-inspired meals</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Plan
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search meal plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat || 'all')}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
                  {plan.category && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {plan.category}
                    </Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-2">
                  {plan.calories && (
                    <div className="flex items-center gap-2 text-sm">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-700">{plan.calories} cal</span>
                    </div>
                  )}
                  {plan.servings && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">{plan.servings} servings</span>
                    </div>
                  )}
                  {plan.prep_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-700">{plan.prep_time} min prep</span>
                    </div>
                  )}
                  {plan.cook_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700">{plan.cook_time} min cook</span>
                    </div>
                  )}
                </div>

                {/* Ingredients */}
                {plan.ingredients && plan.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {plan.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {plan.ingredients.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.ingredients.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No meal plans found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
