'use client';

import { Check } from 'lucide-react';

interface BookingStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Menu & Date' },
  { number: 2, title: 'Venue' },
  { number: 3, title: 'Procurement' },
  { number: 4, title: 'Payment' },
];

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  transition-all duration-300
                  ${
                    step.number < currentStep
                      ? 'bg-blue-600 text-white'
                      : step.number === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.number < currentStep ? (
                  <Check className="h-6 w-6" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  mt-2 text-sm font-medium
                  ${step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-4 rounded-full transition-all duration-300
                  ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
