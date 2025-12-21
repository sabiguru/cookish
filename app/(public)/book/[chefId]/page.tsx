'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { AddressForm, addressSchema, type AddressFormData } from '@/components/booking/AddressForm';
import { IngredientList, type PayerType } from '@/components/booking/IngredientList';
import { PaymentWidget } from '@/components/booking/PaymentWidget';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { z } from 'zod';

// Mock data - in production, fetch from API
const mockMenus = [
  { id: '1', title: 'Italian Feast', pricePerPerson: 45 },
  { id: '2', title: 'Japanese Experience', pricePerPerson: 65 },
  { id: '3', title: 'Mediterranean Delight', pricePerPerson: 50 },
];

const mockIngredients = [
  {
    id: '1',
    name: 'Pasta Course',
    ingredients: [
      { id: 'ing-1', name: 'Fresh Pasta', quantity: 500, unit: 'g', estimatedCost: 8.50 },
      { id: 'ing-2', name: 'Tomatoes', quantity: 6, unit: 'piece', estimatedCost: 4.20 },
      { id: 'ing-3', name: 'Parmesan', quantity: 200, unit: 'g', estimatedCost: 6.00 },
    ],
  },
  {
    id: '2',
    name: 'Main Course',
    ingredients: [
      { id: 'ing-4', name: 'Chicken Breast', quantity: 800, unit: 'g', estimatedCost: 12.00 },
      { id: 'ing-5', name: 'Olive Oil', quantity: 100, unit: 'ml', estimatedCost: 3.50 },
    ],
  },
];

const occasions = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Corporate Event',
  'Family Gathering',
  'Other',
];

const bookingSchema = z.object({
  menuId: z.string().min(1, 'Please select a menu'),
  date: z.date({ required_error: 'Please select a date' }),
  guests: z.number().min(1, 'At least 1 guest required').max(50, 'Maximum 50 guests'),
  occasion: z.string().optional(),
  notes: z.string().optional(),
});

export default function BookChefPage({ params }: { params: { chefId: string } }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [menuId, setMenuId] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(4);

  // Step 2 state
  const [address, setAddress] = useState<AddressFormData>({
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    saveAddress: false,
  });
  const [occasion, setOccasion] = useState('');
  const [notes, setNotes] = useState('');
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  // Step 3 state
  const [payerMap, setPayerMap] = useState<Record<string, PayerType>>({});

  const selectedMenu = mockMenus.find(m => m.id === menuId);
  const menuCost = selectedMenu ? selectedMenu.pricePerPerson * guests : 0;

  const ingredientCost = mockIngredients.reduce((total, item) => {
    return total + item.ingredients.reduce((sum, ing) => {
      const payer = payerMap[ing.id] || 'USER';
      if (payer === 'USER') return sum + ing.estimatedCost;
      if (payer === 'SPLIT') return sum + (ing.estimatedCost / 2);
      return sum;
    }, 0);
  }, 0);

  const totalCost = menuCost + ingredientCost;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!menuId || !date || guests < 1) {
        alert('Please fill in all required fields');
        return;
      }
    }

    if (currentStep === 2) {
      try {
        addressSchema.parse(address);
        setAddressErrors({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Partial<Record<keyof AddressFormData, string>> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as keyof AddressFormData] = err.message;
            }
          });
          setAddressErrors(errors);
          return;
        }
      }
    }

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePayment = async (paymentMethodId: string, couponCode?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chefId: params.chefId,
          menuId,
          date: date?.toISOString(),
          guests,
          occasion,
          notes,
          address,
          payerMap,
          paymentMethodId,
          couponCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/bookings/${data.bookingId}`);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientToggle = (ingredientId: string, payer: PayerType) => {
    setPayerMap(prev => ({ ...prev, [ingredientId]: payer }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BookingStepper currentStep={currentStep} />

        <div className="mt-8">
          {/* Step 1: Menu & Date */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Select Menu & Date</h2>

              <div>
                <Label htmlFor="menu">Menu</Label>
                <Select value={menuId} onValueChange={setMenuId}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Choose a menu" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title} - £{menu.pricePerPerson}/person
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <div className="mt-1.5 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-2xl border shadow-md"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={50}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Step 2: Venue Details */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Venue Details</h2>

              <AddressForm
                value={address}
                onChange={setAddress}
                errors={addressErrors}
              />

              <div>
                <Label htmlFor="occasion">Occasion (Optional)</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map((occ) => (
                      <SelectItem key={occ} value={occ}>
                        {occ}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Special Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any dietary requirements, allergies, or special requests..."
                  className="mt-1.5 rounded-xl"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Procurement */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Ingredient Procurement</h2>
                <p className="text-gray-600 mt-2">
                  Choose who will purchase each ingredient
                </p>
              </div>

              <IngredientList
                menuItems={mockIngredients}
                onToggleChange={handleIngredientToggle}
                initialPayerMap={payerMap}
              />
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Complete Payment</h2>

              <PaymentWidget
                amount={totalCost}
                breakdown={[
                  { label: `Menu (${guests} guests × £${selectedMenu?.pricePerPerson})`, amount: menuCost },
                  { label: 'Your ingredient share', amount: ingredientCost },
                ]}
                onPayment={handlePayment}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
