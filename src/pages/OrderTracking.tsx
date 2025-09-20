import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const OrderTracking = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');
  const [loading, setLoading] = useState(false);
  const trackingInputRef = useRef<HTMLInputElement>(null);

  const handleOrderTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingResult(null);
    setTrackingError('');
    setLoading(true);
    if (!trackingInput.trim()) {
      setTrackingError('Please enter an order ID or email.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/functions/v1/get_order_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: trackingInput.match(/^\d+$/) ? trackingInput : undefined,
          email: trackingInput.includes('@') ? trackingInput : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setTrackingResult(data.order);
    } catch (err: any) {
      setTrackingError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white px-2 sm:px-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-lg p-4 sm:p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Track Your Order</h1>
        <form onSubmit={handleOrderTracking} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-4">
          <input
            ref={trackingInputRef}
            type="text"
            placeholder="Enter Order ID or Email"
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value)}
            className="border rounded px-3 py-2 w-full text-black min-h-[44px]"
          />
          <Button type="submit" disabled={loading} className="min-h-[44px]">{loading ? 'Searching...' : 'Track'}</Button>
        </form>
        {trackingError && <div className="text-red-400 text-sm mb-2 text-center">{trackingError}</div>}
        {trackingResult && (
          <div className="bg-white/80 rounded shadow p-4 mt-2 text-black text-sm sm:text-base overflow-x-auto">
            <div><b>Order ID:</b> {trackingResult.id}</div>
            <div><b>Status:</b> {trackingResult.status || trackingResult.order_status}</div>
            <div><b>Customer:</b> {trackingResult.customer_info?.name || trackingResult.customer_name}</div>
            <div><b>Email:</b> {trackingResult.customer_info?.email || trackingResult.customer_email}</div>
            <div><b>Total:</b> ₦{(trackingResult.total_amount || 0).toLocaleString()}</div>
            <div><b>Created At:</b> {trackingResult.created_at}</div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
              onClick={async () => {
                const res = await fetch('/functions/v1/generate-invoice', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: trackingResult.id }),
                });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `invoice_${trackingResult.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } else {
                  alert('Failed to generate invoice.');
                }
              }}
            >
              Download Invoice (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking; 