
export type CartMessageType = 
  | 'CART_DATA'
  | 'CHECKOUT_INITIATED'
  | 'CHECKOUT_BUTTON_CLICKED'
  | 'CART_READY'
  | 'TENERA_CART_UPDATE'
  | 'IFRAME_READY'
  | 'CART_RECEIVED';

export interface CartMessage {
  type: CartMessageType;
  cart?: any[];
  cartItems?: any[];
  items?: any[];
  payload?: any[];
  data?: any;
  timestamp?: string;
  source?: string;
}

export interface MessageResponse {
  type: string;
  success: boolean;
  itemCount?: number;
  timestamp?: string;
}
