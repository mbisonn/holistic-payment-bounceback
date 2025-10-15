import React from 'react';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Tag, 
  Star, 
  MessageSquare, 
  BarChart3, 
  Mail, 
  CreditCard, 
  Gift, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Target,
  Database,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Bell,
  FileText,
  Image,
  Video,
  MapPin,
  UserPlus,
  UserMinus,
  Settings,
  Shield,
  Award,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Archive,
  Lock,
  Unlock,
  Play,
  Pause,
  Stop,
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
  Heart as HeartIcon,
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
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  Hand,
  Fingerprint,
  Key,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Shield as ShieldIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  AlertOctagon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
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
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  CalendarSearch,
  CalendarHeart,
  CalendarStar,
  CalendarClock,
  CalendarUser,
  CalendarSettings,
  CalendarEdit,
  CalendarTrash,
  CalendarCopy,
  CalendarArchive,
  CalendarLock,
  CalendarUnlock,
  CalendarPlay,
  CalendarPause,
  CalendarStop,
  CalendarRefresh,
  CalendarFilter,
  CalendarSearch as CalendarSearchIcon,
  CalendarBookmark,
  CalendarFlag,
  CalendarHelp,
  CalendarInfo,
  CalendarExternal,
  CalendarLink,
  CalendarShare,
  CalendarMaximize,
  CalendarMinimize,
  CalendarRotateCcw,
  CalendarRotateCw,
  CalendarMove,
  CalendarGrid,
  CalendarList,
  CalendarLayout,
  CalendarLayers,
  CalendarBox,
  CalendarCircle,
  CalendarSquare,
  CalendarTriangle,
  CalendarHexagon,
  CalendarOctagon,
  CalendarDiamond,
  CalendarHeart as CalendarHeartIcon,
  CalendarSmile,
  CalendarFrown,
  CalendarMeh,
  CalendarLaugh,
  CalendarAngry,
  CalendarSad,
  CalendarSurprised,
  CalendarWink,
  CalendarTongue,
  CalendarKiss,
  CalendarHug,
  CalendarThumbsUp,
  CalendarThumbsDown,
  CalendarHand,
  CalendarFingerprint,
  CalendarKey,
  CalendarLock as CalendarLockIcon,
  CalendarUnlock as CalendarUnlockIcon,
  CalendarShield,
  CalendarShieldCheck,
  CalendarShieldAlert,
  CalendarShieldX,
  CalendarAlertCircle,
  CalendarAlertOctagon,
  CalendarAlertTriangle,
  CalendarCheck as CalendarCheckIcon,
  CalendarX as CalendarXIcon,
  CalendarInfo as CalendarInfoIcon,
  CalendarHelp as CalendarHelpIcon,
  CalendarLightbulb,
  CalendarFlame,
  CalendarSnowflake,
  CalendarSun,
  CalendarMoon,
  CalendarCloud,
  CalendarCloudRain,
  CalendarCloudSnow,
  CalendarCloudLightning,
  CalendarWind,
  CalendarDroplets,
  CalendarThermometer,
  CalendarGauge,
  CalendarTimer,
  CalendarStopwatch,
  Crown
} from 'lucide-react';

export interface TriggerDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  configFields?: {
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'date';
    label: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
  }[];
  isPremium?: boolean;
}

export const TRIGGER_CATEGORIES = {
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  CUSTOMERS: 'Customers',
  UPSELLS: 'Upsells/Downsells',
  ORDER_BUMPS: 'Order Bumps',
  TAGS: 'Tags',
  REPUTATION: 'Reputation',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  DISCOUNTS: 'Discounts',
  ANALYTICS: 'Analytics',
  MEAL_PLAN: 'Meal Plan Sync',
  SETTINGS: 'Settings',
  USER_CENTER: 'User Center'
};

export const TRIGGER_DEFINITIONS: TriggerDefinition[] = [
  // PRODUCTS TRIGGERS
  {
    id: 'product_created',
    name: 'Product Created',
    description: 'Occurs when a new product is added to the store',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: Package,
    configFields: [
      {
        name: 'category',
        type: 'select',
        label: 'Product Category',
        options: [
          { value: 'all', label: 'All Categories' },
          { value: 'supplements', label: 'Supplements' },
          { value: 'books', label: 'Books' },
          { value: 'courses', label: 'Courses' }
        ]
      }
    ]
  },
  {
    id: 'product_updated',
    name: 'Product Updated',
    description: 'Occurs when a product is modified',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: Edit,
    configFields: [
      {
        name: 'fields',
        type: 'select',
        label: 'Updated Fields',
        options: [
          { value: 'any', label: 'Any Field' },
          { value: 'price', label: 'Price Only' },
          { value: 'stock', label: 'Stock Only' },
          { value: 'description', label: 'Description Only' }
        ]
      }
    ]
  },
  {
    id: 'product_deleted',
    name: 'Product Deleted',
    description: 'Occurs when a product is removed from the store',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: Trash2
  },
  {
    id: 'product_stock_low',
    name: 'Product Stock Low',
    description: 'Occurs when product stock falls below threshold',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: AlertTriangle,
    configFields: [
      {
        name: 'threshold',
        type: 'number',
        label: 'Stock Threshold',
        placeholder: '10',
        required: true
      }
    ]
  },
  {
    id: 'product_stock_out',
    name: 'Product Stock Out',
    description: 'Occurs when product stock reaches zero',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: XCircle
  },
  {
    id: 'product_price_changed',
    name: 'Product Price Changed',
    description: 'Occurs when a product price is modified',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: DollarSign,
    configFields: [
      {
        name: 'change_type',
        type: 'select',
        label: 'Price Change Type',
        options: [
          { value: 'any', label: 'Any Change' },
          { value: 'increase', label: 'Price Increase' },
          { value: 'decrease', label: 'Price Decrease' }
        ]
      }
    ]
  },
  {
    id: 'product_activated',
    name: 'Product Activated',
    description: 'Occurs when a product is activated',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: Play
  },
  {
    id: 'product_deactivated',
    name: 'Product Deactivated',
    description: 'Occurs when a product is deactivated',
    category: TRIGGER_CATEGORIES.PRODUCTS,
    icon: Pause
  },

  // ORDERS TRIGGERS
  {
    id: 'order_created',
    name: 'Order Created',
    description: 'Occurs when a new order is placed',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: ShoppingBag,
    configFields: [
      {
        name: 'min_amount',
        type: 'number',
        label: 'Minimum Order Amount',
        placeholder: '0'
      }
    ]
  },
  {
    id: 'order_confirmed',
    name: 'Order Confirmed',
    description: 'Occurs when an order is confirmed',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: CheckCircle
  },
  {
    id: 'order_processing',
    name: 'Order Processing',
    description: 'Occurs when an order enters processing',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: RefreshCw
  },
  {
    id: 'order_shipped',
    name: 'Order Shipped',
    description: 'Occurs when an order is shipped',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: Package
  },
  {
    id: 'order_delivered',
    name: 'Order Delivered',
    description: 'Occurs when an order is delivered',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: CheckCircle
  },
  {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    description: 'Occurs when an order is cancelled',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: XCircle
  },
  {
    id: 'order_refunded',
    name: 'Order Refunded',
    description: 'Occurs when an order is refunded',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: RotateCcw
  },
  {
    id: 'order_payment_failed',
    name: 'Order Payment Failed',
    description: 'Occurs when order payment fails',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: AlertTriangle
  },
  {
    id: 'order_payment_completed',
    name: 'Order Payment Completed',
    description: 'Occurs when order payment is successful',
    category: TRIGGER_CATEGORIES.ORDERS,
    icon: CreditCard
  },

  // CUSTOMER TRIGGERS
  {
    id: 'customer_registered',
    name: 'Customer Registered',
    description: 'Occurs when a new customer registers',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: UserPlus
  },
  {
    id: 'customer_profile_updated',
    name: 'Customer Profile Updated',
    description: 'Occurs when customer profile is modified',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Edit
  },
  {
    id: 'customer_first_purchase',
    name: 'Customer First Purchase',
    description: 'Occurs when customer makes their first purchase',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Gift
  },
  {
    id: 'customer_nth_purchase',
    name: 'Customer Nth Purchase',
    description: 'Occurs when customer reaches purchase milestone',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Award,
    configFields: [
      {
        name: 'purchase_count',
        type: 'number',
        label: 'Purchase Count',
        placeholder: '5',
        required: true
      }
    ]
  },
  {
    id: 'customer_inactive',
    name: 'Customer Inactive',
    description: 'Occurs when customer is inactive for specified days',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Clock,
    configFields: [
      {
        name: 'days',
        type: 'number',
        label: 'Days Inactive',
        placeholder: '30',
        required: true
      }
    ]
  },
  {
    id: 'customer_birthday',
    name: 'Customer Birthday',
    description: 'Occurs on customer birthday',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Gift
  },
  {
    id: 'customer_anniversary',
    name: 'Customer Anniversary',
    description: 'Occurs on customer registration anniversary',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Calendar
  },
  {
    id: 'customer_vip_status',
    name: 'Customer VIP Status Reached',
    description: 'Occurs when customer reaches VIP status',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: Crown,
    configFields: [
      {
        name: 'spent_amount',
        type: 'number',
        label: 'Minimum Spent Amount',
        placeholder: '1000',
        required: true
      }
    ]
  },
  {
    id: 'customer_spent_over',
    name: 'Customer Spent Over Amount',
    description: 'Occurs when customer spends over specified amount',
    category: TRIGGER_CATEGORIES.CUSTOMERS,
    icon: DollarSign,
    configFields: [
      {
        name: 'amount',
        type: 'number',
        label: 'Amount Threshold',
        placeholder: '500',
        required: true
      }
    ]
  },

  // UPSELL/DOWNSELL TRIGGERS
  {
    id: 'upsell_offered',
    name: 'Upsell Offered',
    description: 'Occurs when upsell is offered to customer',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: TrendingUp
  },
  {
    id: 'upsell_accepted',
    name: 'Upsell Accepted',
    description: 'Occurs when customer accepts upsell',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: CheckCircle
  },
  {
    id: 'upsell_declined',
    name: 'Upsell Declined',
    description: 'Occurs when customer declines upsell',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: XCircle
  },
  {
    id: 'downsell_offered',
    name: 'Downsell Offered',
    description: 'Occurs when downsell is offered to customer',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: TrendingDown
  },
  {
    id: 'downsell_accepted',
    name: 'Downsell Accepted',
    description: 'Occurs when customer accepts downsell',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: CheckCircle
  },
  {
    id: 'downsell_declined',
    name: 'Downsell Declined',
    description: 'Occurs when customer declines downsell',
    category: TRIGGER_CATEGORIES.UPSELLS,
    icon: XCircle
  },

  // ORDER BUMP TRIGGERS
  {
    id: 'order_bump_shown',
    name: 'Order Bump Shown',
    description: 'Occurs when order bump is displayed',
    category: TRIGGER_CATEGORIES.ORDER_BUMPS,
    icon: Eye
  },
  {
    id: 'order_bump_added',
    name: 'Order Bump Added',
    description: 'Occurs when order bump is added to cart',
    category: TRIGGER_CATEGORIES.ORDER_BUMPS,
    icon: Plus
  },
  {
    id: 'order_bump_removed',
    name: 'Order Bump Removed',
    description: 'Occurs when order bump is removed from cart',
    category: TRIGGER_CATEGORIES.ORDER_BUMPS,
    icon: Minus
  },

  // TAG TRIGGERS
  {
    id: 'tag_added_to_customer',
    name: 'Tag Added to Customer',
    description: 'Occurs when tag is added to customer',
    category: TRIGGER_CATEGORIES.TAGS,
    icon: Tag
  },
  {
    id: 'tag_removed_from_customer',
    name: 'Tag Removed from Customer',
    description: 'Occurs when tag is removed from customer',
    category: TRIGGER_CATEGORIES.TAGS,
    icon: Tag
  },
  {
    id: 'tag_created',
    name: 'Tag Created',
    description: 'Occurs when new tag is created',
    category: TRIGGER_CATEGORIES.TAGS,
    icon: Plus
  },
  {
    id: 'tag_deleted',
    name: 'Tag Deleted',
    description: 'Occurs when tag is deleted',
    category: TRIGGER_CATEGORIES.TAGS,
    icon: Trash2
  },

  // REPUTATION TRIGGERS
  {
    id: 'review_submitted',
    name: 'Review Submitted',
    description: 'Occurs when customer submits review',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: Star
  },
  {
    id: 'review_approved',
    name: 'Review Approved',
    description: 'Occurs when review is approved',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: CheckCircle
  },
  {
    id: 'review_rejected',
    name: 'Review Rejected',
    description: 'Occurs when review is rejected',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: XCircle
  },
  {
    id: 'rating_received',
    name: 'Rating Received',
    description: 'Occurs when customer provides rating',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: Star
  },
  {
    id: 'rating_above_threshold',
    name: 'Rating Above Threshold',
    description: 'Occurs when rating is above specified threshold',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: ThumbsUp,
    configFields: [
      {
        name: 'threshold',
        type: 'number',
        label: 'Rating Threshold',
        placeholder: '4',
        required: true
      }
    ]
  },
  {
    id: 'rating_below_threshold',
    name: 'Rating Below Threshold',
    description: 'Occurs when rating is below specified threshold',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: ThumbsDown,
    configFields: [
      {
        name: 'threshold',
        type: 'number',
        label: 'Rating Threshold',
        placeholder: '3',
        required: true
      }
    ]
  },
  {
    id: 'negative_review_alert',
    name: 'Negative Review Alert',
    description: 'Occurs when negative review is received',
    category: TRIGGER_CATEGORIES.REPUTATION,
    icon: AlertTriangle
  },

  // WHATSAPP TRIGGERS
  {
    id: 'whatsapp_message_sent',
    name: 'WhatsApp Message Sent',
    description: 'Occurs when WhatsApp message is sent',
    category: TRIGGER_CATEGORIES.WHATSAPP,
    icon: Send
  },
  {
    id: 'whatsapp_message_delivered',
    name: 'WhatsApp Message Delivered',
    description: 'Occurs when WhatsApp message is delivered',
    category: TRIGGER_CATEGORIES.WHATSAPP,
    icon: CheckCircle
  },
  {
    id: 'whatsapp_message_read',
    name: 'WhatsApp Message Read',
    description: 'Occurs when WhatsApp message is read',
    category: TRIGGER_CATEGORIES.WHATSAPP,
    icon: Eye
  },
  {
    id: 'whatsapp_message_failed',
    name: 'WhatsApp Message Failed',
    description: 'Occurs when WhatsApp message fails to send',
    category: TRIGGER_CATEGORIES.WHATSAPP,
    icon: XCircle
  },
  {
    id: 'whatsapp_reply_received',
    name: 'WhatsApp Reply Received',
    description: 'Occurs when customer replies to WhatsApp message',
    category: TRIGGER_CATEGORIES.WHATSAPP,
    icon: MessageCircle
  },

  // EMAIL TRIGGERS
  {
    id: 'email_campaign_sent',
    name: 'Email Campaign Sent',
    description: 'Occurs when email campaign is sent',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: Mail
  },
  {
    id: 'email_opened',
    name: 'Email Opened',
    description: 'Occurs when email is opened',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: Eye
  },
  {
    id: 'email_clicked',
    name: 'Email Clicked',
    description: 'Occurs when email link is clicked',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: Target
  },
  {
    id: 'email_bounced',
    name: 'Email Bounced',
    description: 'Occurs when email bounces',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: AlertTriangle
  },
  {
    id: 'email_unsubscribed',
    name: 'Email Unsubscribed',
    description: 'Occurs when customer unsubscribes',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: UserMinus
  },
  {
    id: 'email_replied',
    name: 'Email Replied',
    description: 'Occurs when customer replies to email',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: MessageCircle
  },
  {
    id: 'email_delivered',
    name: 'Email Delivered',
    description: 'Occurs when email is delivered',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: CheckCircle
  },
  {
    id: 'email_failed',
    name: 'Email Failed',
    description: 'Occurs when email fails to send',
    category: TRIGGER_CATEGORIES.EMAIL,
    icon: XCircle
  },

  // DISCOUNT TRIGGERS
  {
    id: 'discount_code_created',
    name: 'Discount Code Created',
    description: 'Occurs when discount code is created',
    category: TRIGGER_CATEGORIES.DISCOUNTS,
    icon: Plus
  },
  {
    id: 'discount_code_used',
    name: 'Discount Code Used',
    description: 'Occurs when discount code is used',
    category: TRIGGER_CATEGORIES.DISCOUNTS,
    icon: CheckCircle
  },
  {
    id: 'discount_code_expired',
    name: 'Discount Code Expired',
    description: 'Occurs when discount code expires',
    category: TRIGGER_CATEGORIES.DISCOUNTS,
    icon: Clock
  },
  {
    id: 'discount_code_limit_reached',
    name: 'Discount Code Limit Reached',
    description: 'Occurs when discount code usage limit is reached',
    category: TRIGGER_CATEGORIES.DISCOUNTS,
    icon: AlertTriangle
  },

  // ANALYTICS TRIGGERS
  {
    id: 'sales_milestone_reached',
    name: 'Sales Milestone Reached',
    description: 'Occurs when sales reach specified milestone',
    category: TRIGGER_CATEGORIES.ANALYTICS,
    icon: Trophy,
    configFields: [
      {
        name: 'amount',
        type: 'number',
        label: 'Sales Amount',
        placeholder: '10000',
        required: true
      }
    ]
  },
  {
    id: 'revenue_target_hit',
    name: 'Revenue Target Hit',
    description: 'Occurs when revenue target is achieved',
    category: TRIGGER_CATEGORIES.ANALYTICS,
    icon: Target
  },
  {
    id: 'daily_goal_achieved',
    name: 'Daily Goal Achieved',
    description: 'Occurs when daily goal is met',
    category: TRIGGER_CATEGORIES.ANALYTICS,
    icon: CheckCircle
  },
  {
    id: 'traffic_spike_detected',
    name: 'Traffic Spike Detected',
    description: 'Occurs when website traffic spikes',
    category: TRIGGER_CATEGORIES.ANALYTICS,
    icon: Activity,
    configFields: [
      {
        name: 'percentage',
        type: 'number',
        label: 'Traffic Increase %',
        placeholder: '50',
        required: true
      }
    ]
  },
  {
    id: 'conversion_rate_changed',
    name: 'Conversion Rate Changed',
    description: 'Occurs when conversion rate changes significantly',
    category: TRIGGER_CATEGORIES.ANALYTICS,
    icon: TrendingUp,
    configFields: [
      {
        name: 'threshold',
        type: 'number',
        label: 'Change Threshold %',
        placeholder: '10',
        required: true
      }
    ]
  }
];

// Helper function to get triggers by category
export const getTriggersByCategory = (category: string): TriggerDefinition[] => {
  return TRIGGER_DEFINITIONS.filter(trigger => trigger.category === category);
};

// Helper function to get trigger by ID
export const getTriggerById = (id: string): TriggerDefinition | undefined => {
  return TRIGGER_DEFINITIONS.find(trigger => trigger.id === id);
};

// Helper function to get all categories
export const getAllTriggerCategories = (): string[] => {
  return Object.values(TRIGGER_CATEGORIES);
};
