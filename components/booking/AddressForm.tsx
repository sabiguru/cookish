'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
  saveAddress: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  value: AddressFormData;
  onChange: (data: AddressFormData) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
}

export function AddressForm({ value, onChange, errors }: AddressFormProps) {
  const handleChange = (field: keyof AddressFormData, fieldValue: string | boolean) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={value.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="123 Main Street"
          className="mt-1.5"
        />
        {errors?.street && (
          <p className="text-sm text-red-600 mt-1">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="London"
            className="mt-1.5"
          />
          {errors?.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            value={value.postcode}
            onChange={(e) => handleChange('postcode', e.target.value)}
            placeholder="SW1A 1AA"
            className="mt-1.5"
          />
          {errors?.postcode && (
            <p className="text-sm text-red-600 mt-1">{errors.postcode}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={value.country}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="United Kingdom"
          className="mt-1.5"
        />
        {errors?.country && (
          <p className="text-sm text-red-600 mt-1">{errors.country}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="saveAddress"
          checked={value.saveAddress}
          onCheckedChange={(checked) => handleChange('saveAddress', checked === true)}
        />
        <label
          htmlFor="saveAddress"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Save this address for future bookings
        </label>
      </div>
    </div>
  );
}
