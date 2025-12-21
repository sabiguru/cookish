'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, Clock, MessageSquare, CalendarDays, Info } from 'lucide-react';

interface Chef {
  id: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  menus: Array<{
    id: string;
    title: string;
    description: string | null;
    pricePerPerson: any;
  }>;
}

interface BookingFormProps {
  chef: Chef | null;
  userId: string;
}

export default function BookingForm({ chef, userId }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    menuId: '',
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    notes: '',
  });

  // Fetch available dates on mount
  useEffect(() => {
    if (!chef) return;

    const fetchAvailableDates = async () => {
      setLoadingDates(true);
      try {
        const response = await fetch(`/api/chef/${chef.id}/available-dates`);
        if (response.ok) {
          const data = await response.json();
          setAvailableDates(new Set(data.availableDates || []));
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [chef]);

  // Fetch available slots when date changes
  const fetchAvailableSlots = async (date: string) => {
    if (!chef || !date) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/chef/${chef.id}/available-slots?date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);

        if (data.availableSlots.length === 0) {
          alert('No available time slots for this date. Please choose another date.');
        }
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setFormData({ ...formData, date: newDate, time: '' }); // Reset time when date changes
    fetchAvailableSlots(newDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chef) {
      alert('Please select a chef first');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chefId: chef.id,
          menuId: formData.menuId,
          date: bookingDateTime.toISOString(),
          guests: parseInt(formData.guests),
          occasion: formData.occasion || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/user/bookings/${data.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!chef) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">
            Please select a chef from the{' '}
            <a href="/chefs" className="text-primary hover:underline">
              chef directory
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Chef Info */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Selected Chef</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={chef.user.image || undefined} />
              <AvatarFallback>
                {chef.user.name?.substring(0, 2).toUpperCase() || 'CH'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{chef.user.name}</h3>
              <p className="text-sm text-gray-500">{chef.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Menu Selection */}
          <div>
            <Label htmlFor="menuId">Select Menu *</Label>
            <Select
              value={formData.menuId}
              onValueChange={(value) =>
                setFormData({ ...formData, menuId: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a menu" />
              </SelectTrigger>
              <SelectContent>
                {chef.menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.title} - £{Number(menu.pricePerPerson)}/person
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Info */}
          {loadingDates ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Loading chef's availability...
              </AlertDescription>
            </Alert>
          ) : availableDates.size === 0 ? (
            <Alert>
              <CalendarDays className="h-4 w-4" />
              <AlertDescription>
                This chef has no available dates in the next 60 days. Please check back later or contact the chef directly.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CalendarDays className="h-4 w-4" />
              <AlertDescription>
                <strong>{availableDates.size} available dates</strong> in the next 60 days. Select a date below to see available time slots.
              </AlertDescription>
            </Alert>
          )}

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">
                <Calendar className="h-4 w-4 inline mr-2" />
                Available Dates *
              </Label>
              {loadingDates ? (
                <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : availableDates.size > 0 ? (
                <Select
                  value={formData.date}
                  onValueChange={handleDateChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an available date" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from(availableDates).sort().map((date) => {
                      const dateObj = new Date(date + 'T00:00:00');
                      return (
                        <SelectItem key={date} value={date}>
                          {dateObj.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-red-50">
                  <span className="text-sm text-red-600">No available dates</span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="time">
                <Clock className="h-4 w-4 inline mr-2" />
                Time *
              </Label>
              {loadingSlots ? (
                <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Loading available slots...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <Select
                  value={formData.time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, time: value })
                  }
                  required
                  disabled={!formData.date}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select available time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : formData.date ? (
                <div className="h-10 flex items-center px-3 border rounded-md bg-red-50">
                  <span className="text-sm text-red-600">No slots available for this date</span>
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Select a date first</span>
                </div>
              )}
            </div>
          </div>

          {/* Number of Guests */}
          <div>
            <Label htmlFor="guests">
              <Users className="h-4 w-4 inline mr-2" />
              Number of Guests *
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="50"
              value={formData.guests}
              onChange={(e) =>
                setFormData({ ...formData, guests: e.target.value })
              }
              required
            />
          </div>

          {/* Occasion */}
          <div>
            <Label htmlFor="occasion">Occasion (Optional)</Label>
            <Input
              id="occasion"
              type="text"
              placeholder="e.g., Birthday, Anniversary, Corporate Event"
              value={formData.occasion}
              onChange={(e) =>
                setFormData({ ...formData, occasion: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Special Requests (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any dietary restrictions, preferences, or special requests..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.menuId || !formData.date || !formData.time}
          className="rounded-xl flex-1"
        >
          {loading ? 'Creating Booking...' : 'Confirm Booking'}
        </Button>
      </div>
    </form>
  );
}
