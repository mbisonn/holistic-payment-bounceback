
import { HomeIcon, Settings, Package, Users, TrendingUp, ShoppingBag, DollarSign, Tag, Truck, UserCheck } from "lucide-react";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin/dashboard",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Products",
    to: "/admin/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: "Orders",
    to: "/admin/orders",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    title: "Order Bumps",
    to: "/admin/order-bumps",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    title: "Discount Codes",
    to: "/admin/discount-codes",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    title: "Shipping Settings",
    to: "/admin/shipping-settings",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    title: "CRM",
    to: "/admin/crm",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    title: "Users",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Upsell Links",
    to: "/admin/upsell-links",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: "Settings",
    to: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];
