
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdditionalInfoCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          These payment links use the Supabase Edge Function set up for your upsell/downsell products.
          When a customer clicks on these links, they will be directed to a Paystack payment page to complete their purchase.
        </p>
        <p>
          You can add these links to any webpage or landing page builder such as Systeme.io, ClickFunnels, or WordPress.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoCard;
