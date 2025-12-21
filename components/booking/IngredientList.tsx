'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type PayerType = 'USER' | 'CHEF' | 'SPLIT';

export interface IngredientItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface IngredientListProps {
  menuItems: {
    id: string;
    name: string;
    ingredients: IngredientItem[];
  }[];
  onToggleChange: (ingredientId: string, payer: PayerType) => void;
  initialPayerMap?: Record<string, PayerType>;
}

export function IngredientList({
  menuItems,
  onToggleChange,
  initialPayerMap = {}
}: IngredientListProps) {
  const [payerMap, setPayerMap] = useState<Record<string, PayerType>>(initialPayerMap);

  const handleToggle = (ingredientId: string, payer: PayerType) => {
    setPayerMap(prev => ({ ...prev, [ingredientId]: payer }));
    onToggleChange(ingredientId, payer);
  };

  const totalCost = menuItems.reduce((total, item) => {
    return total + item.ingredients.reduce((sum, ing) => sum + ing.estimatedCost, 0);
  }, 0);

  const userCost = menuItems.reduce((total, item) => {
    return total + item.ingredients.reduce((sum, ing) => {
      const payer = payerMap[ing.id] || 'USER';
      if (payer === 'USER') return sum + ing.estimatedCost;
      if (payer === 'SPLIT') return sum + (ing.estimatedCost / 2);
      return sum;
    }, 0);
  }, 0);

  const chefCost = totalCost - userCost;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Ingredient Procurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {menuItems.map((item) => (
              <div key={item.id}>
                <h4 className="font-semibold text-gray-900 mb-3">{item.name}</h4>
                <div className="space-y-3">
                  {item.ingredients.map((ingredient) => {
                    const payer = payerMap[ingredient.id] || 'USER';

                    return (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{ingredient.name}</p>
                          <p className="text-sm text-gray-500">
                            {ingredient.quantity} {ingredient.unit} - £{ingredient.estimatedCost.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={payer === 'CHEF' ? 'default' : 'outline'}
                            onClick={() => handleToggle(ingredient.id, 'CHEF')}
                            className={cn(
                              'rounded-full text-xs',
                              payer === 'CHEF' && 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            Chef
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={payer === 'USER' ? 'default' : 'outline'}
                            onClick={() => handleToggle(ingredient.id, 'USER')}
                            className={cn(
                              'rounded-full text-xs',
                              payer === 'USER' && 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            You
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={payer === 'SPLIT' ? 'default' : 'outline'}
                            onClick={() => handleToggle(ingredient.id, 'SPLIT')}
                            className={cn(
                              'rounded-full text-xs',
                              payer === 'SPLIT' && 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            Split
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your portion:</span>
                <span className="font-semibold text-gray-900">£{userCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chef portion:</span>
                <span className="font-semibold text-gray-900">£{chefCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total ingredients:</span>
                <span>£{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
