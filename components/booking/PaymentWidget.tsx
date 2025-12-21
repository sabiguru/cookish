'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type PaymentMethod = 'card' | 'paypal';

interface PaymentWidgetProps {
  amount: number;
  currency?: string;
  breakdown: {
    label: string;
    amount: number;
  }[];
  onPayment: (paymentMethodId: string, couponCode?: string) => Promise<void>;
  loading?: boolean;
}

export function PaymentWidget({
  amount,
  currency = 'GBP',
  breakdown,
  onPayment,
  loading = false
}: PaymentWidgetProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  const finalAmount = amount - discount;

  const handleApplyCoupon = async () => {
    // Placeholder for coupon validation
    // In production, this would call an API to validate the coupon
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(amount * 0.1);
    }
  };

  const handleCompleteBooking = async () => {
    setProcessingPayment(true);
    try {
      // In production, this would integrate with Stripe Elements
      // For now, we'll use a placeholder payment method ID
      await onPayment('pm_placeholder_' + Date.now(), couponCode || undefined);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
          <div className="space-y-2">
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-900">
                  £{item.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({couponCode})</span>
                <span className="font-medium">-£{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>£{finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <Label className="mb-3 block">Payment Method</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
                paymentMethod === 'paypal'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">P</span>
              </div>
              <span className="text-sm font-medium">PayPal</span>
            </button>
          </div>
        </div>

        {/* Card Details (Placeholder) */}
        {paymentMethod === 'card' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Coupon Code */}
        <div>
          <Label htmlFor="coupon">Coupon Code (Optional)</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              className="rounded-xl"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Complete Booking Button */}
        <Button
          onClick={handleCompleteBooking}
          disabled={loading || processingPayment}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-semibold"
        >
          {(loading || processingPayment) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Complete Booking - £{finalAmount.toFixed(2)}</>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          By completing this booking, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}
