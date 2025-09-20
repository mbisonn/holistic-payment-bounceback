
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EmptyCartMessage: React.FC = () => {
  return (
    <Card className="mb-8">
      <CardHeader className="text-center">
        <CardTitle>Your Cart is Empty</CardTitle>
        <CardDescription>No items have been added to your cart yet</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Please return to our sales page to browse our wellness products
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyCartMessage;
