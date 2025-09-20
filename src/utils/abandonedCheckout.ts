
// Simplified abandoned checkout utility without database dependency
export const saveAbandonedCheckout = async (checkoutData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  cart_items: any[];
}) => {
  try {
    // For now, just store in localStorage as we don't have the abandoned_checkouts table
    const abandonedCheckouts = JSON.parse(localStorage.getItem('abandonedCheckouts') || '[]');
    const newCheckout = {
      ...checkoutData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    
    abandonedCheckouts.push(newCheckout);
    localStorage.setItem('abandonedCheckouts', JSON.stringify(abandonedCheckouts));
    
    console.log('Abandoned checkout saved:', newCheckout);
    return newCheckout;
  } catch (error) {
    console.error('Error saving abandoned checkout:', error);
    throw error;
  }
};

export const getAbandonedCheckouts = () => {
  try {
    return JSON.parse(localStorage.getItem('abandonedCheckouts') || '[]');
  } catch (error) {
    console.error('Error getting abandoned checkouts:', error);
    return [];
  }
};
