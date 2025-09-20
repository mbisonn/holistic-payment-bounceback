
export interface UpsellProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  duration_months?: number | null;
  created_at: string;
  image?: string;
}
