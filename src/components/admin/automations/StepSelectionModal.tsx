import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap, Mail, ShoppingCart, User, Tag, Clock, Filter, MessageSquare, CreditCard, Gift, CheckCircle, Database, XCircle,
  LayoutDashboard, Package, TrendingUp, Plus, Star, BarChart3, Settings, ArrowRight, Search, TrendingDown, Crown, Award,
  Bell, Eye, ThumbsUp, ThumbsDown, MessageCircle, Send, Download, Upload, RefreshCw, Bookmark, Flag, HelpCircle, Info,
  ExternalLink, Link, Share, Maximize, Minimize, RotateCcw, RotateCw, Move, Grid, List, Layout, Layers, Box, Circle,
  Square, Triangle, Hexagon, Octagon, Diamond, Smile, Frown, Meh, Laugh, Angry, Sad, Surprised, Wink, Tongue, Kiss,
  Hug, Hand, Fingerprint, Key, Lock, Unlock, Shield, ShieldCheck, ShieldAlert, ShieldX, AlertCircle, AlertOctagon,
  Lightbulb, Flame, Snowflake, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer,
  Gauge, Timer, Stopwatch, Calendar, UserPlus, UserMinus, FileText, Image, Video, MapPin, Edit, Trash2, Copy, Archive,
  Play, Pause, Stop, X, Check, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Activity, PieChart, LineChart, BarChart, DollarSign, Percent, Hash, AtSign, Heart, Target, AlertTriangle, Minus
} from 'lucide-react';
import { TRIGGER_DEFINITIONS, getTriggersByCategory } from './triggers/TriggerDefinitions';
import { ACTION_DEFINITIONS, getActionsByCategory } from './actions/ActionDefinitions';

interface StepSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStep: (stepType: 'action' | 'decision' | 'delay', stepId: string) => void;
  stepType: 'action' | 'decision' | 'delay' | null;
}

// Map trigger categories to icons already imported above
const categoryIconMap: Record<string, React.ComponentType<any>> = {
  'Products': Package,
  'Orders': ShoppingCart,
  'Customers': User,
  'Upsells/Downsells': TrendingUp,
  'Order Bumps': Plus,
  'Tags': Tag,
  'Reputation': Star,
  'WhatsApp': MessageCircle,
  'Email': Mail,
  'Discounts': DollarSign,
  'Analytics': BarChart3,
  'Meal Plan Sync': Calendar,
  'Settings': Settings,
  'User Center': User
};

// Group flat trigger definitions by category for rendering
const GROUPED_TRIGGERS: Record<string, { name: string; icon: React.ComponentType<any>; triggers: typeof TRIGGER_DEFINITIONS }>
  = (Array.isArray(TRIGGER_DEFINITIONS)
    ? TRIGGER_DEFINITIONS.reduce((acc: any, trigger: any) => {
        const category = trigger.category || 'Other';
        if (!acc[category]) {
          acc[category] = {
            name: category,
            icon: categoryIconMap[category] || Zap,
            triggers: []
          };
        }
        acc[category].triggers.push(trigger);
        return acc;
      }, {})
    : {});

const DECISION_OPTIONS = [
  {
    id: 'has_tag',
    name: 'Has Tag',
    description: 'Split the path based on whether contact has a specific tag',
    icon: Tag,
    category: 'Contact Segmentation'
  },
  {
    id: 'purchase_value',
    name: 'Purchase Value',
    description: 'Split the path based on purchase amount',
    icon: CreditCard,
    category: 'E-commerce'
  },
  {
    id: 'customer_segment',
    name: 'Customer Segment',
    description: 'Split the path based on customer segment',
    icon: User,
    category: 'Contact Segmentation'
  },
  {
    id: 'order_count',
    name: 'Order Count',
    description: 'Split the path based on number of orders',
    icon: ShoppingCart,
    category: 'E-commerce'
  },
  {
    id: 'product_category',
    name: 'Product Category',
    description: 'Split the path based on product category purchased',
    icon: Package,
    category: 'E-commerce'
  },
  {
    id: 'customer_lifetime_value',
    name: 'Customer Lifetime Value',
    description: 'Split the path based on customer total spending',
    icon: DollarSign,
    category: 'Customer Analytics'
  },
  {
    id: 'last_purchase_date',
    name: 'Last Purchase Date',
    description: 'Split the path based on when customer last made a purchase',
    icon: Calendar,
    category: 'Customer Analytics'
  },
  {
    id: 'email_engagement',
    name: 'Email Engagement',
    description: 'Split the path based on email open/click rates',
    icon: Mail,
    category: 'Email Marketing'
  }
];

const DELAY_OPTIONS = [
  {
    id: 'wait_minutes',
    name: 'Wait Minutes',
    description: 'Wait for specified minutes before continuing',
    icon: Clock,
    category: 'Timing'
  },
  {
    id: 'wait_hours',
    name: 'Wait Hours',
    description: 'Wait for specified hours before continuing',
    icon: Clock,
    category: 'Timing'
  },
  {
    id: 'wait_days',
    name: 'Wait Days',
    description: 'Wait for specified days before continuing',
    icon: Clock,
    category: 'Timing'
  },
  {
    id: 'wait_weeks',
    name: 'Wait Weeks',
    description: 'Wait for specified weeks before continuing',
    icon: Clock,
    category: 'Timing'
  },
  {
    id: 'wait_until_time',
    name: 'Wait Until Time',
    description: 'Wait until a specific time of day',
    icon: Timer,
    category: 'Timing'
  },
  {
    id: 'wait_until_date',
    name: 'Wait Until Date',
    description: 'Wait until a specific date',
    icon: Calendar,
    category: 'Timing'
  },
  {
    id: 'wait_for_condition',
    name: 'Wait For Condition',
    description: 'Wait until a specific condition is met',
    icon: Filter,
    category: 'Conditional'
  }
];

export default function StepSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectStep, 
  stepType 
}: StepSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('triggers');

  const getTitle = () => {
    switch (stepType) {
      case 'action':
        return 'Add Action';
      case 'decision':
        return 'Add Decision';
      case 'delay':
        return 'Add Delay';
      default:
        return 'Add Step';
    }
  };

  const getOptions = () => {
    switch (stepType) {
      case 'action':
        return ACTION_DEFINITIONS;
      case 'decision':
        return DECISION_OPTIONS;
      case 'delay':
        return DELAY_OPTIONS;
      default:
        return [];
    }
  };

  const filteredOptions = getOptions().filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = filteredOptions.reduce((groups, option) => {
    if (!groups[option.category]) {
      groups[option.category] = [];
    }
    groups[option.category].push(option);
    return groups;
  }, {} as Record<string, any[]>);

  const handleSelectStep = (stepId: string) => {
    if (stepType) {
      onSelectStep(stepType, stepId);
      onClose();
    }
  };

  const renderTriggerOptions = () => {
    const filteredTriggers = Object
      .entries(GROUPED_TRIGGERS)
      .filter(([_, categoryData]: any) =>
        (categoryData?.triggers || []).some((trigger: any) =>
          trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (trigger.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (categoryData.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    return (
      <div className="space-y-4">
        {filteredTriggers.map(([categoryKey, categoryData]: any) => {
          const Icon = categoryData?.icon || Zap;
          const filteredCategoryTriggers = (categoryData?.triggers || []).filter((trigger: any) =>
            trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (trigger.description || '').toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredCategoryTriggers.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className="h-4 w-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  {categoryData?.name}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {filteredCategoryTriggers.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {filteredCategoryTriggers.map((trigger) => (
                  <button
                    key={trigger.id}
                    onClick={() => handleSelectStep(trigger.id)}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 group-hover:text-blue-900">
                          {trigger.name}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          {trigger.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderActionOptions = () => {
    return (
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([category, options]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 px-1">
              {category}
            </h4>
            <div className="space-y-1">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectStep(option.id)}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900 group-hover:text-green-900">
                            {option.name}
                          </h5>
                          {option.isPremium && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDecisionOptions = () => {
    return (
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([category, options]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 px-1">
              {category}
            </h4>
            <div className="space-y-1">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectStep(option.id)}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                        <Icon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 group-hover:text-purple-900">
                          {option.name}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDelayOptions = () => {
    return (
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([category, options]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 px-1">
              {category}
            </h4>
            <div className="space-y-1">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectStep(option.id)}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <Icon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 group-hover:text-orange-900">
                          {option.name}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (stepType === 'action') {
      return renderActionOptions();
    } else if (stepType === 'decision') {
      return renderDecisionOptions();
    } else if (stepType === 'delay') {
      return renderDelayOptions();
    } else {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="triggers" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Triggers
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="triggers" className="mt-4">
            <ScrollArea className="h-96">
              {renderTriggerOptions()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions" className="mt-4">
            <ScrollArea className="h-96">
              {renderActionOptions()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search steps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Content */}
          <div className="min-h-96">
            {renderContent()}
          </div>

          {filteredOptions.length === 0 && stepType && (
            <div className="text-center py-8">
              <p className="text-gray-500">No steps found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}