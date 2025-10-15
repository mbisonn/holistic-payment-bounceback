import { 
  Mail, 
  ShoppingBag, 
  Star, 
  Package, 
  Crown, 
  Gift, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Tag,
  MessageSquare,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Zap,
  Heart,
  Target,
  Award,
  Bell,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  Bookmark,
  Flag,
  HelpCircle,
  Info,
  ExternalLink,
  Link,
  Share,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Move,
  Grid,
  List,
  Layout,
  Layers,
  Box,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprised,
  Wink,
  Tongue,
  Kiss,
  Hug,
  Hand,
  Fingerprint,
  Key,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  AlertOctagon,
  Lightbulb,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Timer,
  Stopwatch,
  Calendar,
  User,
  UserPlus,
  UserMinus,
  Settings,
  Database,
  FileText,
  Image,
  Video,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Archive,
  Play,
  Pause,
  Stop,
  X,
  Check,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DollarSign as DollarSignIcon,
  Percent,
  Hash,
  AtSign,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Percent as PercentIcon,
  Hash as HashIcon2,
  AtSign as AtSignIcon2,
  Percent as PercentIcon2
} from 'lucide-react';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
    delay?: number; // in minutes
  }>;
  isPremium: boolean;
  tags: string[];
  estimatedSetupTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCases: string[];
  expectedResults: string[];
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  // WELCOME SERIES
  {
    id: 'welcome_series',
    name: 'Welcome Series',
    description: 'Send a series of welcome emails to new customers to introduce your brand and products',
    category: 'Email Marketing',
    icon: Mail,
    trigger: {
      type: 'customer_registered',
      config: {}
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'welcome_email_1',
          subject: 'Welcome to our community!'
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'welcome_email_2',
          subject: 'Here\'s what you can expect'
        },
        delay: 1440 // 24 hours
      },
      {
        type: 'send_email',
        config: {
          template_id: 'welcome_email_3',
          subject: 'Your first special offer'
        },
        delay: 4320 // 72 hours
      }
    ],
    isPremium: false,
    tags: ['welcome', 'onboarding', 'email', 'new-customers'],
    estimatedSetupTime: '5 minutes',
    difficulty: 'beginner',
    useCases: [
      'Introduce new customers to your brand',
      'Set expectations for future communications',
      'Provide valuable content and resources',
      'Build trust and engagement'
    ],
    expectedResults: [
      'Higher email open rates',
      'Increased customer engagement',
      'Better brand awareness',
      'Improved customer retention'
    ]
  },

  // ABANDONED CART RECOVERY
  {
    id: 'abandoned_cart_recovery',
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned carts with targeted email sequences to increase sales',
    category: 'E-commerce',
    icon: ShoppingBag,
    trigger: {
      type: 'cart_abandoned',
      config: {
        delay_hours: 1
      }
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'cart_abandoned_1',
          subject: 'You forgot something in your cart!'
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'cart_abandoned_2',
          subject: 'Still thinking about it? Here\'s a special offer'
        },
        delay: 1440 // 24 hours
      },
      {
        type: 'send_email',
        config: {
          template_id: 'cart_abandoned_3',
          subject: 'Last chance - Your cart expires soon!'
        },
        delay: 4320 // 72 hours
      }
    ],
    isPremium: false,
    tags: ['cart', 'recovery', 'sales', 'ecommerce'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'beginner',
    useCases: [
      'Recover lost sales from abandoned carts',
      'Increase conversion rates',
      'Reduce cart abandonment',
      'Boost revenue'
    ],
    expectedResults: [
      '15-25% cart recovery rate',
      'Increased sales revenue',
      'Better customer engagement',
      'Reduced cart abandonment'
    ]
  },

  // ORDER CONFIRMATION
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    description: 'Send order confirmation and shipping updates to customers',
    category: 'Order Management',
    icon: CheckCircle,
    trigger: {
      type: 'order_created',
      config: {}
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'order_confirmation',
          subject: 'Order Confirmation - Thank you!'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Thank you for your order! We\'ll send you updates on your shipment.'
        },
        delay: 5
      }
    ],
    isPremium: false,
    tags: ['order', 'confirmation', 'shipping', 'customer-service'],
    estimatedSetupTime: '5 minutes',
    difficulty: 'beginner',
    useCases: [
      'Confirm orders immediately',
      'Provide order details',
      'Set shipping expectations',
      'Improve customer experience'
    ],
    expectedResults: [
      'Reduced customer inquiries',
      'Better customer satisfaction',
      'Professional order handling',
      'Clear communication'
    ]
  },

  // SHIPPING UPDATE
  {
    id: 'shipping_update',
    name: 'Shipping Update',
    description: 'Notify customers when their order ships and provide tracking information',
    category: 'Order Management',
    icon: Package,
    trigger: {
      type: 'order_shipped',
      config: {}
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'shipping_notification',
          subject: 'Your order has shipped!'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Great news! Your order is on its way. Track it here: {tracking_link}'
        },
        delay: 10
      }
    ],
    isPremium: false,
    tags: ['shipping', 'tracking', 'updates', 'logistics'],
    estimatedSetupTime: '5 minutes',
    difficulty: 'beginner',
    useCases: [
      'Keep customers informed about shipping',
      'Provide tracking information',
      'Reduce support inquiries',
      'Improve delivery experience'
    ],
    expectedResults: [
      'Reduced shipping inquiries',
      'Better customer satisfaction',
      'Professional shipping updates',
      'Improved delivery experience'
    ]
  },

  // REVIEW REQUEST
  {
    id: 'review_request',
    name: 'Review Request',
    description: 'Request reviews from customers after they receive their order',
    category: 'Reputation Management',
    icon: Star,
    trigger: {
      type: 'order_delivered',
      config: {
        delay_days: 3
      }
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'review_request',
          subject: 'How was your experience? We\'d love your feedback!'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Hi! We hope you\'re enjoying your purchase. Could you spare a moment to leave a review?'
        },
        delay: 60 // 1 hour
      }
    ],
    isPremium: false,
    tags: ['reviews', 'feedback', 'reputation', 'social-proof'],
    estimatedSetupTime: '5 minutes',
    difficulty: 'beginner',
    useCases: [
      'Collect customer reviews',
      'Build social proof',
      'Improve product ratings',
      'Gather feedback'
    ],
    expectedResults: [
      'Increased review collection',
      'Better product ratings',
      'More social proof',
      'Improved reputation'
    ]
  },

  // LOW STOCK ALERT
  {
    id: 'low_stock_alert',
    name: 'Low Stock Alert',
    description: 'Notify admin when product stock falls below threshold',
    category: 'Inventory Management',
    icon: AlertTriangle,
    trigger: {
      type: 'product_stock_low',
      config: {
        threshold: 10
      }
    },
    actions: [
      {
        type: 'send_admin_alert',
        config: {
          alert_type: 'warning',
          message: 'Product {product_name} is running low on stock ({current_stock} remaining)'
        },
        delay: 0
      },
      {
        type: 'create_task',
        config: {
          assignee: 'admin',
          title: 'Restock Product: {product_name}',
          description: 'Product is running low on stock. Current stock: {current_stock}',
          priority: 'high'
        },
        delay: 0
      }
    ],
    isPremium: false,
    tags: ['inventory', 'stock', 'alerts', 'management'],
    estimatedSetupTime: '5 minutes',
    difficulty: 'beginner',
    useCases: [
      'Prevent stockouts',
      'Maintain inventory levels',
      'Alert management team',
      'Automate inventory management'
    ],
    expectedResults: [
      'Reduced stockouts',
      'Better inventory management',
      'Proactive restocking',
      'Improved operations'
    ]
  },

  // VIP CUSTOMER
  {
    id: 'vip_customer',
    name: 'VIP Customer',
    description: 'Automatically tag customers as VIP when they reach spending threshold',
    category: 'Customer Segmentation',
    icon: Crown,
    trigger: {
      type: 'customer_spent_over',
      config: {
        amount: 1000
      }
    },
    actions: [
      {
        type: 'add_tag',
        config: {
          tag_id: 'vip_customer'
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'vip_welcome',
          subject: 'Welcome to VIP status!'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'VIP20',
          type: 'percentage',
          value: 20,
          expiry_date: '+30d'
        },
        delay: 0
      }
    ],
    isPremium: false,
    tags: ['vip', 'segmentation', 'loyalty', 'rewards'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Identify high-value customers',
      'Provide VIP benefits',
      'Increase customer loyalty',
      'Reward spending behavior'
    ],
    expectedResults: [
      'Better customer segmentation',
      'Increased customer loyalty',
      'Higher customer lifetime value',
      'Improved retention'
    ]
  },

  // BIRTHDAY CAMPAIGN
  {
    id: 'birthday_campaign',
    name: 'Birthday Campaign',
    description: 'Send birthday wishes and special offers to customers',
    category: 'Customer Engagement',
    icon: Gift,
    trigger: {
      type: 'customer_birthday',
      config: {}
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'birthday_wishes',
          subject: 'Happy Birthday! Here\'s a special gift for you'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'BIRTHDAY15',
          type: 'percentage',
          value: 15,
          expiry_date: '+7d'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Happy Birthday! 🎉 Check your email for a special birthday surprise!'
        },
        delay: 30
      }
    ],
    isPremium: false,
    tags: ['birthday', 'personalization', 'engagement', 'offers'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Personalize customer experience',
      'Increase engagement',
      'Drive sales with special offers',
      'Build emotional connection'
    ],
    expectedResults: [
      'Higher engagement rates',
      'Increased sales',
      'Better customer relationships',
      'Improved brand loyalty'
    ]
  },

  // WIN-BACK CAMPAIGN
  {
    id: 'win_back_campaign',
    name: 'Win-back Campaign',
    description: 'Re-engage inactive customers with special offers',
    category: 'Customer Retention',
    icon: Heart,
    trigger: {
      type: 'customer_inactive',
      config: {
        days: 30
      }
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'win_back_1',
          subject: 'We miss you! Here\'s a special welcome back offer'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'COMEBACK20',
          type: 'percentage',
          value: 20,
          expiry_date: '+14d'
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'win_back_2',
          subject: 'Last chance - Your special offer expires soon!'
        },
        delay: 10080 // 7 days
      }
    ],
    isPremium: false,
    tags: ['retention', 'win-back', 'inactive', 're-engagement'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Re-engage inactive customers',
      'Reduce customer churn',
      'Recover lost revenue',
      'Improve retention rates'
    ],
    expectedResults: [
      'Increased customer reactivation',
      'Reduced churn rate',
      'Recovered revenue',
      'Better retention metrics'
    ]
  },

  // UPSELL SEQUENCE
  {
    id: 'upsell_sequence',
    name: 'Upsell Sequence',
    description: 'Offer complementary products to customers after purchase',
    category: 'Sales Optimization',
    icon: TrendingUp,
    trigger: {
      type: 'order_completed',
      config: {}
    },
    actions: [
      {
        type: 'offer_upsell',
        config: {
          upsell_product_id: 'complementary_product',
          discount_percentage: 10
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'upsell_offer',
          subject: 'Complete your purchase with these recommended items'
        },
        delay: 60 // 1 hour
      }
    ],
    isPremium: false,
    tags: ['upsell', 'sales', 'revenue', 'cross-sell'],
    estimatedSetupTime: '15 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Increase average order value',
      'Boost revenue per customer',
      'Cross-sell related products',
      'Maximize sales opportunities'
    ],
    expectedResults: [
      'Higher average order value',
      'Increased revenue',
      'Better product discovery',
      'Improved sales metrics'
    ]
  },

  // REFUND PROCESS
  {
    id: 'refund_process',
    name: 'Refund Process',
    description: 'Handle refund requests with automated notifications and processing',
    category: 'Customer Service',
    icon: RotateCcw,
    trigger: {
      type: 'order_refunded',
      config: {}
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'refund_confirmation',
          subject: 'Your refund has been processed'
        },
        delay: 0
      },
      {
        type: 'send_admin_alert',
        config: {
          alert_type: 'info',
          message: 'Refund processed for order {order_id} - Amount: {refund_amount}'
        },
        delay: 0
      },
      {
        type: 'add_customer_note',
        config: {
          note: 'Refund processed on {date} for order {order_id}'
        },
        delay: 0
      }
    ],
    isPremium: false,
    tags: ['refund', 'customer-service', 'process', 'notifications'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Automate refund notifications',
      'Keep customers informed',
      'Track refund processes',
      'Improve customer service'
    ],
    expectedResults: [
      'Faster refund processing',
      'Better customer communication',
      'Reduced support workload',
      'Improved service quality'
    ]
  },

  // PRICE DROP ALERT
  {
    id: 'price_drop_alert',
    name: 'Price Drop Alert',
    description: 'Notify interested customers when product prices drop',
    category: 'Marketing',
    icon: DollarSign,
    trigger: {
      type: 'product_price_changed',
      config: {
        change_type: 'decrease'
      }
    },
    actions: [
      {
        type: 'send_email_to_segment',
        config: {
          segment: 'price_alert_subscribers',
          template_id: 'price_drop_alert',
          subject: 'Price Drop Alert: {product_name} is now {new_price}!'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Great news! {product_name} is now on sale for {new_price}. Don\'t miss out!'
        },
        delay: 30
      }
    ],
    isPremium: true,
    tags: ['price', 'alerts', 'marketing', 'sales'],
    estimatedSetupTime: '15 minutes',
    difficulty: 'advanced',
    useCases: [
      'Drive sales with price drops',
      'Re-engage interested customers',
      'Increase conversion rates',
      'Maximize revenue opportunities'
    ],
    expectedResults: [
      'Increased sales during price drops',
      'Better customer engagement',
      'Higher conversion rates',
      'Improved revenue optimization'
    ]
  },

  // NEW PRODUCT LAUNCH
  {
    id: 'new_product_launch',
    name: 'New Product Launch',
    description: 'Announce new products to your customer base with special launch offers',
    category: 'Product Marketing',
    icon: Package,
    trigger: {
      type: 'product_created',
      config: {}
    },
    actions: [
      {
        type: 'send_email_campaign',
        config: {
          campaign_id: 'new_product_launch',
          segment: 'all_customers'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'LAUNCH20',
          type: 'percentage',
          value: 20,
          expiry_date: '+7d'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Exciting news! We just launched {product_name}. Check it out with 20% off!'
        },
        delay: 60
      }
    ],
    isPremium: true,
    tags: ['launch', 'new-product', 'marketing', 'announcement'],
    estimatedSetupTime: '20 minutes',
    difficulty: 'advanced',
    useCases: [
      'Announce new products',
      'Drive initial sales',
      'Build product awareness',
      'Create launch excitement'
    ],
    expectedResults: [
      'Strong product launch',
      'High initial sales',
      'Increased brand awareness',
      'Better product adoption'
    ]
  },

  // CUSTOMER FEEDBACK COLLECTION
  {
    id: 'customer_feedback_collection',
    name: 'Customer Feedback Collection',
    description: 'Collect feedback from customers after they use your product or service',
    category: 'Customer Experience',
    icon: MessageCircle,
    trigger: {
      type: 'order_delivered',
      config: {
        delay_days: 7
      }
    },
    actions: [
      {
        type: 'send_email',
        config: {
          template_id: 'feedback_request',
          subject: 'How was your experience? We\'d love to hear from you!'
        },
        delay: 0
      },
      {
        type: 'create_task',
        config: {
          assignee: 'customer_success',
          title: 'Follow up with customer: {customer_name}',
          description: 'Customer received order 7 days ago. Follow up for feedback.',
          priority: 'medium'
        },
        delay: 10080 // 7 days
      }
    ],
    isPremium: false,
    tags: ['feedback', 'experience', 'improvement', 'insights'],
    estimatedSetupTime: '10 minutes',
    difficulty: 'intermediate',
    useCases: [
      'Collect customer feedback',
      'Improve products/services',
      'Measure satisfaction',
      'Identify improvement areas'
    ],
    expectedResults: [
      'Better customer insights',
      'Improved products/services',
      'Higher satisfaction scores',
      'Data-driven improvements'
    ]
  },

  // LOYALTY PROGRAM ENROLLMENT
  {
    id: 'loyalty_program_enrollment',
    name: 'Loyalty Program Enrollment',
    description: 'Automatically enroll customers in loyalty program based on purchase behavior',
    category: 'Customer Loyalty',
    icon: Award,
    trigger: {
      type: 'customer_nth_purchase',
      config: {
        purchase_count: 3
      }
    },
    actions: [
      {
        type: 'add_to_loyalty_program',
        config: {
          program: 'bronze'
        },
        delay: 0
      },
      {
        type: 'send_email',
        config: {
          template_id: 'loyalty_welcome',
          subject: 'Welcome to our Loyalty Program!'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'LOYALTY10',
          type: 'percentage',
          value: 10,
          expiry_date: '+30d'
        },
        delay: 0
      }
    ],
    isPremium: true,
    tags: ['loyalty', 'program', 'retention', 'rewards'],
    estimatedSetupTime: '15 minutes',
    difficulty: 'advanced',
    useCases: [
      'Build customer loyalty',
      'Increase repeat purchases',
      'Reward frequent customers',
      'Improve retention rates'
    ],
    expectedResults: [
      'Higher customer retention',
      'Increased repeat purchases',
      'Better customer loyalty',
      'Improved lifetime value'
    ]
  },

  // SEASONAL CAMPAIGN
  {
    id: 'seasonal_campaign',
    name: 'Seasonal Campaign',
    description: 'Launch seasonal marketing campaigns with special offers and themed content',
    category: 'Marketing',
    icon: Calendar,
    trigger: {
      type: 'specific_date',
      config: {
        date: '2024-12-01' // Example: December 1st
      }
    },
    actions: [
      {
        type: 'send_email_campaign',
        config: {
          campaign_id: 'seasonal_campaign',
          segment: 'all_customers'
        },
        delay: 0
      },
      {
        type: 'create_discount_code',
        config: {
          code: 'SEASON25',
          type: 'percentage',
          value: 25,
          expiry_date: '+30d'
        },
        delay: 0
      },
      {
        type: 'send_whatsapp_message',
        config: {
          message: 'Season\'s greetings! 🎄 Enjoy 25% off everything with code SEASON25'
        },
        delay: 120
      }
    ],
    isPremium: true,
    tags: ['seasonal', 'marketing', 'campaigns', 'holidays'],
    estimatedSetupTime: '25 minutes',
    difficulty: 'advanced',
    useCases: [
      'Launch seasonal promotions',
      'Drive holiday sales',
      'Create themed campaigns',
      'Maximize seasonal opportunities'
    ],
    expectedResults: [
      'Increased seasonal sales',
      'Better campaign performance',
      'Higher engagement rates',
      'Improved brand awareness'
    ]
  }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): AutomationTemplate[] => {
  return AUTOMATION_TEMPLATES.filter(template => template.category === category);
};

// Helper function to get template by ID
export const getTemplateById = (id: string): AutomationTemplate | undefined => {
  return AUTOMATION_TEMPLATES.find(template => template.id === id);
};

// Helper function to get all categories
export const getAllTemplateCategories = (): string[] => {
  const categories = new Set(AUTOMATION_TEMPLATES.map(template => template.category));
  return Array.from(categories);
};

// Helper function to get popular templates
export const getPopularTemplates = (): AutomationTemplate[] => {
  return AUTOMATION_TEMPLATES.filter(template => 
    ['welcome_series', 'abandoned_cart_recovery', 'order_confirmation', 'review_request'].includes(template.id)
  );
};

// Helper function to get beginner templates
export const getBeginnerTemplates = (): AutomationTemplate[] => {
  return AUTOMATION_TEMPLATES.filter(template => template.difficulty === 'beginner');
};

// Helper function to get premium templates
export const getPremiumTemplates = (): AutomationTemplate[] => {
  return AUTOMATION_TEMPLATES.filter(template => template.isPremium);
};

// Helper function to search templates
export const searchTemplates = (query: string): AutomationTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return AUTOMATION_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  );
};
