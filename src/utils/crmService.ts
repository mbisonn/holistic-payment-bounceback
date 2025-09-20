
export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  total_orders?: number | null;
  total_spent?: number | null;
  last_order_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
}

export const trackPageVisit = (email: string, page: string) => {
  console.log('Page visit tracked:', { email, page });
};

export const updateCustomerProfile = (profile: Partial<CustomerProfile>) => {
  console.log('Customer profile updated:', profile);
};

export const getCustomerProfiles = async (): Promise<CustomerProfile[]> => {
  // Mock implementation for now
  return [];
};
