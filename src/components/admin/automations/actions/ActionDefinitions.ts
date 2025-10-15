import React from 'react';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Minus,
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
  Crown,
  Trophy,
  Medal,
  Badge,
  Certificate,
  Scroll,
  Book,
  BookOpen,
  Newspaper,
  File,
  Folder,
  FolderOpen,
  Save,
  Loader,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Printer,
  Scanner,
  Camera,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Volume2,
  VolumeX,
  Music,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  FastForward,
  Rewind,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Music as MusicIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  StopCircle as StopCircleIcon,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
  FastForward as FastForwardIcon,
  Rewind as RewindIcon
} from 'lucide-react';

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  configFields?: {
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea' | 'email' | 'url';
    label: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }[];
  isPremium?: boolean;
  requiresAuth?: boolean;
}

export const ACTION_CATEGORIES = {
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
  NOTIFICATIONS: 'Notifications',
  MEAL_PLAN: 'Meal Plan Sync',
  SETTINGS: 'Settings',
  USER_CENTER: 'User Center'
};

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // PRODUCT ACTIONS
  {
    id: 'create_product',
    name: 'Create Product',
    description: 'Create a new product in the store',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Package,
    configFields: [
      {
        name: 'name',
        type: 'text',
        label: 'Product Name',
        placeholder: 'Enter product name',
        required: true
      },
      {
        name: 'price',
        type: 'number',
        label: 'Price',
        placeholder: '0.00',
        required: true,
        validation: { min: 0 }
      },
      {
        name: 'category',
        type: 'select',
        label: 'Category',
        options: [
          { value: 'supplements', label: 'Supplements' },
          { value: 'books', label: 'Books' },
          { value: 'courses', label: 'Courses' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'update_product',
    name: 'Update Product',
    description: 'Update an existing product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Edit,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      },
      {
        name: 'fields',
        type: 'select',
        label: 'Fields to Update',
        options: [
          { value: 'price', label: 'Price' },
          { value: 'stock', label: 'Stock' },
          { value: 'description', label: 'Description' },
          { value: 'status', label: 'Status' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'delete_product',
    name: 'Delete Product',
    description: 'Delete a product from the store',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Trash2,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      }
    ]
  },
  {
    id: 'adjust_product_price',
    name: 'Adjust Product Price',
    description: 'Change the price of a product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: DollarSign,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      },
      {
        name: 'new_price',
        type: 'number',
        label: 'New Price',
        placeholder: '0.00',
        required: true,
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'update_stock_quantity',
    name: 'Update Stock Quantity',
    description: 'Update the stock quantity of a product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Package,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      },
      {
        name: 'quantity',
        type: 'number',
        label: 'Stock Quantity',
        placeholder: '0',
        required: true,
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'activate_product',
    name: 'Activate Product',
    description: 'Activate a product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Play,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      }
    ]
  },
  {
    id: 'deactivate_product',
    name: 'Deactivate Product',
    description: 'Deactivate a product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Pause,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      }
    ]
  },
  {
    id: 'duplicate_product',
    name: 'Duplicate Product',
    description: 'Create a copy of an existing product',
    category: ACTION_CATEGORIES.PRODUCTS,
    icon: Copy,
    configFields: [
      {
        name: 'product_id',
        type: 'select',
        label: 'Product to Duplicate',
        required: true
      },
      {
        name: 'new_name',
        type: 'text',
        label: 'New Product Name',
        placeholder: 'Enter new product name',
        required: true
      }
    ]
  },

  // ORDER ACTIONS
  {
    id: 'create_order',
    name: 'Create Order',
    description: 'Create a new order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: ShoppingBag,
    configFields: [
      {
        name: 'customer_email',
        type: 'email',
        label: 'Customer Email',
        placeholder: 'customer@example.com',
        required: true
      },
      {
        name: 'product_id',
        type: 'select',
        label: 'Product',
        required: true
      },
      {
        name: 'quantity',
        type: 'number',
        label: 'Quantity',
        placeholder: '1',
        required: true,
        validation: { min: 1 }
      }
    ]
  },
  {
    id: 'update_order_status',
    name: 'Update Order Status',
    description: 'Change the status of an order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: RefreshCw,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'status',
        type: 'select',
        label: 'New Status',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'cancel_order',
    name: 'Cancel Order',
    description: 'Cancel an existing order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: XCircle,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'reason',
        type: 'textarea',
        label: 'Cancellation Reason',
        placeholder: 'Enter reason for cancellation'
      }
    ]
  },
  {
    id: 'process_refund',
    name: 'Process Refund',
    description: 'Process a refund for an order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: RotateCcw,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'amount',
        type: 'number',
        label: 'Refund Amount',
        placeholder: '0.00',
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'send_order_confirmation',
    name: 'Send Order Confirmation',
    description: 'Send order confirmation email to customer',
    category: ACTION_CATEGORIES.ORDERS,
    icon: Mail,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      }
    ]
  },
  {
    id: 'send_shipping_notification',
    name: 'Send Shipping Notification',
    description: 'Send shipping notification to customer',
    category: ACTION_CATEGORIES.ORDERS,
    icon: Package,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'tracking_number',
        type: 'text',
        label: 'Tracking Number',
        placeholder: 'Enter tracking number'
      }
    ]
  },
  {
    id: 'send_delivery_confirmation',
    name: 'Send Delivery Confirmation',
    description: 'Send delivery confirmation to customer',
    category: ACTION_CATEGORIES.ORDERS,
    icon: CheckCircle,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      }
    ]
  },
  {
    id: 'add_order_note',
    name: 'Add Order Note',
    description: 'Add a note to an order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: FileText,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'note',
        type: 'textarea',
        label: 'Note',
        placeholder: 'Enter order note',
        required: true
      }
    ]
  },
  {
    id: 'apply_discount_to_order',
    name: 'Apply Discount to Order',
    description: 'Apply a discount code to an order',
    category: ACTION_CATEGORIES.ORDERS,
    icon: Tag,
    configFields: [
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'discount_code',
        type: 'text',
        label: 'Discount Code',
        placeholder: 'Enter discount code',
        required: true
      }
    ]
  },

  // CUSTOMER ACTIONS
  {
    id: 'create_customer',
    name: 'Create Customer',
    description: 'Create a new customer profile',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: UserPlus,
    configFields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'customer@example.com',
        required: true
      },
      {
        name: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter full name',
        required: true
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890'
      }
    ]
  },
  {
    id: 'update_customer_profile',
    name: 'Update Customer Profile',
    description: 'Update customer profile information',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: Edit,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'fields',
        type: 'select',
        label: 'Fields to Update',
        options: [
          { value: 'name', label: 'Name' },
          { value: 'phone', label: 'Phone' },
          { value: 'address', label: 'Address' },
          { value: 'birthday', label: 'Birthday' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'add_customer_note',
    name: 'Add Customer Note',
    description: 'Add a note to customer profile',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: FileText,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'note',
        type: 'textarea',
        label: 'Note',
        placeholder: 'Enter customer note',
        required: true
      }
    ]
  },
  {
    id: 'assign_customer_segment',
    name: 'Assign Customer Segment',
    description: 'Assign customer to a specific segment',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: Users,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'segment',
        type: 'select',
        label: 'Segment',
        options: [
          { value: 'vip', label: 'VIP' },
          { value: 'regular', label: 'Regular' },
          { value: 'new', label: 'New Customer' },
          { value: 'inactive', label: 'Inactive' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'calculate_customer_ltv',
    name: 'Calculate Customer LTV',
    description: 'Calculate customer lifetime value',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: DollarSign,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      }
    ]
  },
  {
    id: 'mark_as_vip',
    name: 'Mark as VIP',
    description: 'Mark customer as VIP',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: Crown,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      }
    ]
  },
  {
    id: 'add_to_loyalty_program',
    name: 'Add to Loyalty Program',
    description: 'Add customer to loyalty program',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: Award,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'program',
        type: 'select',
        label: 'Loyalty Program',
        options: [
          { value: 'bronze', label: 'Bronze' },
          { value: 'silver', label: 'Silver' },
          { value: 'gold', label: 'Gold' },
          { value: 'platinum', label: 'Platinum' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'send_customer_notification',
    name: 'Send Customer Notification',
    description: 'Send notification to customer',
    category: ACTION_CATEGORIES.CUSTOMERS,
    icon: Bell,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter notification message',
        required: true
      }
    ]
  },

  // TAG ACTIONS
  {
    id: 'add_tag',
    name: 'Add Tag',
    description: 'Add a tag to customer',
    category: ACTION_CATEGORIES.TAGS,
    icon: Tag,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'tag_id',
        type: 'select',
        label: 'Tag',
        required: true
      }
    ]
  },
  {
    id: 'remove_tag',
    name: 'Remove Tag',
    description: 'Remove a tag from customer',
    category: ACTION_CATEGORIES.TAGS,
    icon: Tag,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'tag_id',
        type: 'select',
        label: 'Tag',
        required: true
      }
    ]
  },
  {
    id: 'create_new_tag',
    name: 'Create New Tag',
    description: 'Create a new tag',
    category: ACTION_CATEGORIES.TAGS,
    icon: Plus,
    configFields: [
      {
        name: 'name',
        type: 'text',
        label: 'Tag Name',
        placeholder: 'Enter tag name',
        required: true
      },
      {
        name: 'color',
        type: 'select',
        label: 'Tag Color',
        options: [
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
          { value: 'red', label: 'Red' },
          { value: 'yellow', label: 'Yellow' },
          { value: 'purple', label: 'Purple' },
          { value: 'orange', label: 'Orange' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'delete_tag',
    name: 'Delete Tag',
    description: 'Delete an existing tag',
    category: ACTION_CATEGORIES.TAGS,
    icon: Trash2,
    configFields: [
      {
        name: 'tag_id',
        type: 'select',
        label: 'Tag',
        required: true
      }
    ]
  },
  {
    id: 'bulk_tag_assignment',
    name: 'Bulk Tag Assignment',
    description: 'Assign tag to multiple customers',
    category: ACTION_CATEGORIES.TAGS,
    icon: Users,
    configFields: [
      {
        name: 'tag_id',
        type: 'select',
        label: 'Tag',
        required: true
      },
      {
        name: 'customer_segment',
        type: 'select',
        label: 'Customer Segment',
        options: [
          { value: 'all', label: 'All Customers' },
          { value: 'vip', label: 'VIP Customers' },
          { value: 'new', label: 'New Customers' },
          { value: 'inactive', label: 'Inactive Customers' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'conditional_tag_assignment',
    name: 'Conditional Tag Assignment',
    description: 'Assign tag based on conditions',
    category: ACTION_CATEGORIES.TAGS,
    icon: Filter,
    configFields: [
      {
        name: 'tag_id',
        type: 'select',
        label: 'Tag',
        required: true
      },
      {
        name: 'condition',
        type: 'select',
        label: 'Condition',
        options: [
          { value: 'spent_over', label: 'Spent Over Amount' },
          { value: 'purchase_count', label: 'Purchase Count' },
          { value: 'last_purchase', label: 'Last Purchase Date' }
        ],
        required: true
      }
    ]
  },

  // EMAIL ACTIONS
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send an email to customer',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Mail,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      },
      {
        name: 'subject',
        type: 'text',
        label: 'Subject',
        placeholder: 'Enter email subject',
        required: true
      }
    ]
  },
  {
    id: 'send_email_campaign',
    name: 'Send Email Campaign',
    description: 'Send email campaign to customer segment',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Mail,
    configFields: [
      {
        name: 'campaign_id',
        type: 'select',
        label: 'Campaign',
        required: true
      },
      {
        name: 'segment',
        type: 'select',
        label: 'Customer Segment',
        options: [
          { value: 'all', label: 'All Customers' },
          { value: 'vip', label: 'VIP Customers' },
          { value: 'new', label: 'New Customers' },
          { value: 'inactive', label: 'Inactive Customers' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'subscribe_to_campaign',
    name: 'Subscribe to Campaign',
    description: 'Subscribe customer to email campaign',
    category: ACTION_CATEGORIES.EMAIL,
    icon: UserPlus,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'campaign_id',
        type: 'select',
        label: 'Campaign',
        required: true
      }
    ]
  },
  {
    id: 'unsubscribe_from_campaign',
    name: 'Unsubscribe from Campaign',
    description: 'Unsubscribe customer from email campaign',
    category: ACTION_CATEGORIES.EMAIL,
    icon: UserMinus,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'campaign_id',
        type: 'select',
        label: 'Campaign',
        required: true
      }
    ]
  },
  {
    id: 'send_transactional_email',
    name: 'Send Transactional Email',
    description: 'Send transactional email to customer',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Mail,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        label: 'Email Type',
        options: [
          { value: 'order_confirmation', label: 'Order Confirmation' },
          { value: 'shipping_notification', label: 'Shipping Notification' },
          { value: 'delivery_confirmation', label: 'Delivery Confirmation' },
          { value: 'password_reset', label: 'Password Reset' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'schedule_email',
    name: 'Schedule Email',
    description: 'Schedule email to be sent later',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Clock,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      },
      {
        name: 'send_date',
        type: 'date',
        label: 'Send Date',
        required: true
      },
      {
        name: 'send_time',
        type: 'text',
        label: 'Send Time',
        placeholder: 'HH:MM',
        required: true
      }
    ]
  },
  {
    id: 'send_email_to_specific_address',
    name: 'Send Email to Specific Address',
    description: 'Send email to specific email address',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Mail,
    configFields: [
      {
        name: 'email_address',
        type: 'email',
        label: 'Email Address',
        placeholder: 'recipient@example.com',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      },
      {
        name: 'subject',
        type: 'text',
        label: 'Subject',
        placeholder: 'Enter email subject',
        required: true
      }
    ]
  },
  {
    id: 'send_email_to_segment',
    name: 'Send Email to Segment',
    description: 'Send email to customer segment',
    category: ACTION_CATEGORIES.EMAIL,
    icon: Users,
    configFields: [
      {
        name: 'segment',
        type: 'select',
        label: 'Customer Segment',
        options: [
          { value: 'all', label: 'All Customers' },
          { value: 'vip', label: 'VIP Customers' },
          { value: 'new', label: 'New Customers' },
          { value: 'inactive', label: 'Inactive Customers' }
        ],
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      }
    ]
  },

  // WHATSAPP ACTIONS
  {
    id: 'send_whatsapp_message',
    name: 'Send WhatsApp Message',
    description: 'Send WhatsApp message to customer',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: MessageSquare,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter WhatsApp message',
        required: true
      }
    ]
  },
  {
    id: 'send_whatsapp_template',
    name: 'Send WhatsApp Template',
    description: 'Send WhatsApp template message',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: MessageSquare,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Template',
        required: true
      }
    ]
  },
  {
    id: 'send_whatsapp_media',
    name: 'Send WhatsApp Media',
    description: 'Send media file via WhatsApp',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: Image,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'media_type',
        type: 'select',
        label: 'Media Type',
        options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
          { value: 'document', label: 'Document' },
          { value: 'audio', label: 'Audio' }
        ],
        required: true
      },
      {
        name: 'media_url',
        type: 'url',
        label: 'Media URL',
        placeholder: 'https://example.com/media.jpg',
        required: true
      }
    ]
  },
  {
    id: 'send_whatsapp_location',
    name: 'Send WhatsApp Location',
    description: 'Send location via WhatsApp',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: MapPin,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'latitude',
        type: 'number',
        label: 'Latitude',
        placeholder: '0.000000',
        required: true
      },
      {
        name: 'longitude',
        type: 'number',
        label: 'Longitude',
        placeholder: '0.000000',
        required: true
      }
    ]
  },
  {
    id: 'send_whatsapp_contact',
    name: 'Send WhatsApp Contact',
    description: 'Send contact card via WhatsApp',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: Users,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'contact_name',
        type: 'text',
        label: 'Contact Name',
        placeholder: 'Enter contact name',
        required: true
      },
      {
        name: 'contact_phone',
        type: 'text',
        label: 'Contact Phone',
        placeholder: '+1234567890',
        required: true
      }
    ]
  },
  {
    id: 'add_to_whatsapp_broadcast',
    name: 'Add to WhatsApp Broadcast List',
    description: 'Add customer to WhatsApp broadcast list',
    category: ACTION_CATEGORIES.WHATSAPP,
    icon: Users,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'broadcast_list',
        type: 'select',
        label: 'Broadcast List',
        required: true
      }
    ]
  },

  // UPSELL/DOWNSELL ACTIONS
  {
    id: 'offer_upsell',
    name: 'Offer Upsell',
    description: 'Offer upsell product to customer',
    category: ACTION_CATEGORIES.UPSELLS,
    icon: TrendingUp,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'upsell_product_id',
        type: 'select',
        label: 'Upsell Product',
        required: true
      },
      {
        name: 'discount_percentage',
        type: 'number',
        label: 'Discount Percentage',
        placeholder: '10',
        validation: { min: 0, max: 100 }
      }
    ]
  },
  {
    id: 'offer_downsell',
    name: 'Offer Downsell',
    description: 'Offer downsell product to customer',
    category: ACTION_CATEGORIES.UPSELLS,
    icon: TrendingDown,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'downsell_product_id',
        type: 'select',
        label: 'Downsell Product',
        required: true
      },
      {
        name: 'discount_percentage',
        type: 'number',
        label: 'Discount Percentage',
        placeholder: '20',
        validation: { min: 0, max: 100 }
      }
    ]
  },
  {
    id: 'apply_upsell_discount',
    name: 'Apply Upsell Discount',
    description: 'Apply discount to upsell offer',
    category: ACTION_CATEGORIES.UPSELLS,
    icon: Tag,
    configFields: [
      {
        name: 'upsell_id',
        type: 'select',
        label: 'Upsell Offer',
        required: true
      },
      {
        name: 'discount_amount',
        type: 'number',
        label: 'Discount Amount',
        placeholder: '0.00',
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'remove_upsell_offer',
    name: 'Remove Upsell Offer',
    description: 'Remove upsell offer from customer',
    category: ACTION_CATEGORIES.UPSELLS,
    icon: XCircle,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'upsell_id',
        type: 'select',
        label: 'Upsell Offer',
        required: true
      }
    ]
  },

  // ORDER BUMP ACTIONS
  {
    id: 'add_order_bump',
    name: 'Add Order Bump',
    description: 'Add order bump to customer cart',
    category: ACTION_CATEGORIES.ORDER_BUMPS,
    icon: Plus,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'bump_product_id',
        type: 'select',
        label: 'Bump Product',
        required: true
      }
    ]
  },
  {
    id: 'remove_order_bump',
    name: 'Remove Order Bump',
    description: 'Remove order bump from customer cart',
    category: ACTION_CATEGORIES.ORDER_BUMPS,
    icon: Minus,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'bump_product_id',
        type: 'select',
        label: 'Bump Product',
        required: true
      }
    ]
  },
  {
    id: 'show_order_bump_offer',
    name: 'Show Order Bump Offer',
    description: 'Display order bump offer to customer',
    category: ACTION_CATEGORIES.ORDER_BUMPS,
    icon: Eye,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'bump_id',
        type: 'select',
        label: 'Order Bump',
        required: true
      }
    ]
  },
  {
    id: 'hide_order_bump_offer',
    name: 'Hide Order Bump Offer',
    description: 'Hide order bump offer from customer',
    category: ACTION_CATEGORIES.ORDER_BUMPS,
    icon: Eye,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'bump_id',
        type: 'select',
        label: 'Order Bump',
        required: true
      }
    ]
  },

  // DISCOUNT ACTIONS
  {
    id: 'create_discount_code',
    name: 'Create Discount Code',
    description: 'Create a new discount code',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Plus,
    configFields: [
      {
        name: 'code',
        type: 'text',
        label: 'Discount Code',
        placeholder: 'SAVE20',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        label: 'Discount Type',
        options: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed Amount' }
        ],
        required: true
      },
      {
        name: 'value',
        type: 'number',
        label: 'Discount Value',
        placeholder: '20',
        required: true,
        validation: { min: 0 }
      },
      {
        name: 'expiry_date',
        type: 'date',
        label: 'Expiry Date'
      }
    ]
  },
  {
    id: 'activate_discount',
    name: 'Activate Discount',
    description: 'Activate a discount code',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Play,
    configFields: [
      {
        name: 'discount_id',
        type: 'select',
        label: 'Discount Code',
        required: true
      }
    ]
  },
  {
    id: 'deactivate_discount',
    name: 'Deactivate Discount',
    description: 'Deactivate a discount code',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Pause,
    configFields: [
      {
        name: 'discount_id',
        type: 'select',
        label: 'Discount Code',
        required: true
      }
    ]
  },
  {
    id: 'apply_discount_to_customer',
    name: 'Apply Discount to Customer',
    description: 'Apply discount code to customer',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Tag,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'discount_code',
        type: 'text',
        label: 'Discount Code',
        placeholder: 'SAVE20',
        required: true
      }
    ]
  },
  {
    id: 'send_discount_code',
    name: 'Send Discount Code',
    description: 'Send discount code to customer',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Mail,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'discount_code',
        type: 'text',
        label: 'Discount Code',
        placeholder: 'SAVE20',
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter message to include with discount code'
      }
    ]
  },
  {
    id: 'extend_discount_expiry',
    name: 'Extend Discount Expiry',
    description: 'Extend discount code expiry date',
    category: ACTION_CATEGORIES.DISCOUNTS,
    icon: Clock,
    configFields: [
      {
        name: 'discount_id',
        type: 'select',
        label: 'Discount Code',
        required: true
      },
      {
        name: 'new_expiry_date',
        type: 'date',
        label: 'New Expiry Date',
        required: true
      }
    ]
  },

  // REPUTATION ACTIONS
  {
    id: 'send_review_request',
    name: 'Send Review Request',
    description: 'Send review request to customer',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: Star,
    configFields: [
      {
        name: 'customer_id',
        type: 'select',
        label: 'Customer',
        required: true
      },
      {
        name: 'order_id',
        type: 'select',
        label: 'Order',
        required: true
      },
      {
        name: 'template_id',
        type: 'select',
        label: 'Email Template',
        required: true
      }
    ]
  },
  {
    id: 'approve_review',
    name: 'Approve Review',
    description: 'Approve a customer review',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: CheckCircle,
    configFields: [
      {
        name: 'review_id',
        type: 'select',
        label: 'Review',
        required: true
      }
    ]
  },
  {
    id: 'reject_review',
    name: 'Reject Review',
    description: 'Reject a customer review',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: XCircle,
    configFields: [
      {
        name: 'review_id',
        type: 'select',
        label: 'Review',
        required: true
      },
      {
        name: 'reason',
        type: 'textarea',
        label: 'Rejection Reason',
        placeholder: 'Enter reason for rejection'
      }
    ]
  },
  {
    id: 'respond_to_review',
    name: 'Respond to Review',
    description: 'Respond to a customer review',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: MessageCircle,
    configFields: [
      {
        name: 'review_id',
        type: 'select',
        label: 'Review',
        required: true
      },
      {
        name: 'response',
        type: 'textarea',
        label: 'Response',
        placeholder: 'Enter your response',
        required: true
      }
    ]
  },
  {
    id: 'hide_review',
    name: 'Hide Review',
    description: 'Hide a customer review',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: Eye,
    configFields: [
      {
        name: 'review_id',
        type: 'select',
        label: 'Review',
        required: true
      }
    ]
  },
  {
    id: 'flag_review_for_moderation',
    name: 'Flag Review for Moderation',
    description: 'Flag review for manual moderation',
    category: ACTION_CATEGORIES.REPUTATION,
    icon: Flag,
    configFields: [
      {
        name: 'review_id',
        type: 'select',
        label: 'Review',
        required: true
      },
      {
        name: 'reason',
        type: 'select',
        label: 'Flag Reason',
        options: [
          { value: 'inappropriate', label: 'Inappropriate Content' },
          { value: 'spam', label: 'Spam' },
          { value: 'fake', label: 'Fake Review' },
          { value: 'other', label: 'Other' }
        ],
        required: true
      }
    ]
  },

  // NOTIFICATION ACTIONS
  {
    id: 'send_internal_notification',
    name: 'Send Internal Notification',
    description: 'Send notification to internal team',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: Bell,
    configFields: [
      {
        name: 'recipient',
        type: 'select',
        label: 'Recipient',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'support', label: 'Support Team' },
          { value: 'sales', label: 'Sales Team' },
          { value: 'all', label: 'All Staff' }
        ],
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter notification message',
        required: true
      }
    ]
  },
  {
    id: 'send_admin_alert',
    name: 'Send Admin Alert',
    description: 'Send alert to admin',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: AlertTriangle,
    configFields: [
      {
        name: 'alert_type',
        type: 'select',
        label: 'Alert Type',
        options: [
          { value: 'error', label: 'Error' },
          { value: 'warning', label: 'Warning' },
          { value: 'info', label: 'Information' },
          { value: 'success', label: 'Success' }
        ],
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Alert Message',
        placeholder: 'Enter alert message',
        required: true
      }
    ]
  },
  {
    id: 'create_task',
    name: 'Create Task',
    description: 'Create a task for team member',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: CheckCircle,
    configFields: [
      {
        name: 'assignee',
        type: 'select',
        label: 'Assign To',
        required: true
      },
      {
        name: 'title',
        type: 'text',
        label: 'Task Title',
        placeholder: 'Enter task title',
        required: true
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Task Description',
        placeholder: 'Enter task description'
      },
      {
        name: 'priority',
        type: 'select',
        label: 'Priority',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'send_slack_message',
    name: 'Send Slack Message',
    description: 'Send message to Slack channel',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: MessageSquare,
    configFields: [
      {
        name: 'channel',
        type: 'text',
        label: 'Slack Channel',
        placeholder: '#general',
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter Slack message',
        required: true
      }
    ],
    requiresAuth: true
  },
  {
    id: 'send_discord_notification',
    name: 'Send Discord Notification',
    description: 'Send notification to Discord channel',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: MessageSquare,
    configFields: [
      {
        name: 'channel_id',
        type: 'text',
        label: 'Discord Channel ID',
        placeholder: '123456789012345678',
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter Discord message',
        required: true
      }
    ],
    requiresAuth: true
  },
  {
    id: 'log_to_system',
    name: 'Log to System',
    description: 'Log event to system logs',
    category: ACTION_CATEGORIES.NOTIFICATIONS,
    icon: FileText,
    configFields: [
      {
        name: 'log_level',
        type: 'select',
        label: 'Log Level',
        options: [
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' }
        ],
        required: true
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Log Message',
        placeholder: 'Enter log message',
        required: true
      }
    ]
  },

  // ANALYTICS ACTIONS
  {
    id: 'track_custom_event',
    name: 'Track Custom Event',
    description: 'Track custom analytics event',
    category: ACTION_CATEGORIES.ANALYTICS,
    icon: Activity,
    configFields: [
      {
        name: 'event_name',
        type: 'text',
        label: 'Event Name',
        placeholder: 'custom_event',
        required: true
      },
      {
        name: 'event_data',
        type: 'textarea',
        label: 'Event Data (JSON)',
        placeholder: '{"key": "value"}'
      }
    ]
  },
  {
    id: 'update_metric',
    name: 'Update Metric',
    description: 'Update analytics metric',
    category: ACTION_CATEGORIES.ANALYTICS,
    icon: BarChart3,
    configFields: [
      {
        name: 'metric_name',
        type: 'text',
        label: 'Metric Name',
        placeholder: 'sales_count',
        required: true
      },
      {
        name: 'metric_value',
        type: 'number',
        label: 'Metric Value',
        placeholder: '100',
        required: true
      }
    ]
  },
  {
    id: 'generate_report',
    name: 'Generate Report',
    description: 'Generate analytics report',
    category: ACTION_CATEGORIES.ANALYTICS,
    icon: FileText,
    configFields: [
      {
        name: 'report_type',
        type: 'select',
        label: 'Report Type',
        options: [
          { value: 'sales', label: 'Sales Report' },
          { value: 'customers', label: 'Customer Report' },
          { value: 'products', label: 'Product Report' },
          { value: 'automations', label: 'Automation Report' }
        ],
        required: true
      },
      {
        name: 'date_range',
        type: 'select',
        label: 'Date Range',
        options: [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'last_7_days', label: 'Last 7 Days' },
          { value: 'last_30_days', label: 'Last 30 Days' },
          { value: 'this_month', label: 'This Month' },
          { value: 'last_month', label: 'Last Month' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'send_analytics_summary',
    name: 'Send Analytics Summary',
    description: 'Send analytics summary to team',
    category: ACTION_CATEGORIES.ANALYTICS,
    icon: Mail,
    configFields: [
      {
        name: 'recipient',
        type: 'email',
        label: 'Recipient Email',
        placeholder: 'team@example.com',
        required: true
      },
      {
        name: 'summary_type',
        type: 'select',
        label: 'Summary Type',
        options: [
          { value: 'daily', label: 'Daily Summary' },
          { value: 'weekly', label: 'Weekly Summary' },
          { value: 'monthly', label: 'Monthly Summary' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'export_data',
    name: 'Export Data',
    description: 'Export data to file',
    category: ACTION_CATEGORIES.ANALYTICS,
    icon: Download,
    configFields: [
      {
        name: 'data_type',
        type: 'select',
        label: 'Data Type',
        options: [
          { value: 'orders', label: 'Orders' },
          { value: 'customers', label: 'Customers' },
          { value: 'products', label: 'Products' },
          { value: 'automations', label: 'Automations' }
        ],
        required: true
      },
      {
        name: 'format',
        type: 'select',
        label: 'Export Format',
        options: [
          { value: 'csv', label: 'CSV' },
          { value: 'json', label: 'JSON' },
          { value: 'xlsx', label: 'Excel' }
        ],
        required: true
      }
    ]
  }
];

// Helper function to get actions by category
export const getActionsByCategory = (category: string): ActionDefinition[] => {
  return ACTION_DEFINITIONS.filter(action => action.category === category);
};

// Helper function to get action by ID
export const getActionById = (id: string): ActionDefinition | undefined => {
  return ACTION_DEFINITIONS.find(action => action.id === id);
};

// Helper function to get all categories
export const getAllActionCategories = (): string[] => {
  return Object.values(ACTION_CATEGORIES);
};
