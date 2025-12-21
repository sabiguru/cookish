'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Trash2, CalendarDays, Repeat, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const AVAILABILITY_TYPES = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'bg-red-100 text-red-800' },
  { value: 'TIME_OFF', label: 'Time Off', color: 'bg-gray-100 text-gray-800' },
];

interface OneTimeAvailability {
  id: string;
  type: string;
  start: string;
  end: string;
  note?: string;
}

interface RecurringAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
  isActive: boolean;
}

export default function ChefAvailabilityPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'one-time' | 'recurring'>('one-time');

  const [oneTimeAvailability, setOneTimeAvailability] = useState<OneTimeAvailability[]>([]);
  const [recurringAvailability, setRecurringAvailability] = useState<RecurringAvailability[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    availabilityType: 'AVAILABLE',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    dayOfWeek: '1',
    recurringStartTime: '09:00',
    recurringEndTime: '17:00',
    note: '',
  });

  // Fetch availability data
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chef/availability');
      const data = await response.json();

      if (response.ok) {
        setOneTimeAvailability(data.oneTime || []);
        setRecurringAvailability(data.recurring || []);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAvailability();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = formType === 'recurring'
        ? {
            type: 'recurring',
            availabilityType: formData.availabilityType,
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.recurringStartTime,
            endTime: formData.recurringEndTime,
            note: formData.note,
          }
        : {
            type: 'one-time',
            availabilityType: formData.availabilityType,
            start: `${formData.startDate}T${formData.startTime}`,
            end: `${formData.endDate}T${formData.endTime}`,
            note: formData.note,
          };

      const response = await fetch('/api/chef/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Availability added successfully!');
        setShowForm(false);
        setFormData({
          availabilityType: 'AVAILABLE',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          dayOfWeek: '1',
          recurringStartTime: '09:00',
          recurringEndTime: '17:00',
          note: '',
        });
        fetchAvailability();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add availability');
      }
    } catch (error) {
      console.error('Failed to add availability:', error);
      alert('Failed to add availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'one-time' | 'recurring') => {
    if (!confirm('Are you sure you want to delete this availability?')) return;

    try {
      const response = await fetch(`/api/chef/availability?id=${id}&type=${type}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Availability deleted successfully!');
        fetchAvailability();
      } else {
        alert('Failed to delete availability');
      }
    } catch (error) {
      console.error('Failed to delete availability:', error);
      alert('Failed to delete availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600 mt-1">
            Set your availability to control when you can accept bookings
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Add Availability
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900">How it works</AlertTitle>
        <AlertDescription className="text-blue-800">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>One-time availability:</strong> Set specific dates and times when you are available or unavailable</li>
            <li><strong>Recurring availability:</strong> Set weekly schedules that repeat every week</li>
            <li><strong>Available:</strong> Customers can book you during these times</li>
            <li><strong>Unavailable/Time Off:</strong> Blocks booking during these periods</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Add Availability Form */}
      {showForm && (
        <Card className="rounded-2xl shadow-md border-2 border-blue-200">
          <CardHeader className="border-b bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle>Add New Availability</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Availability Type Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormType('one-time')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formType === 'one-time'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">One-time</h3>
                      <p className="text-sm text-gray-600">Specific date & time</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setFormType('recurring')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formType === 'recurring'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Repeat className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Recurring</h3>
                      <p className="text-sm text-gray-600">Weekly schedule</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <Label>Status</Label>
                <Select value={formData.availabilityType} onValueChange={(val) => setFormData({...formData, availabilityType: val})}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* One-time Form Fields */}
              {formType === 'one-time' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Recurring Form Fields */}
              {formType === 'recurring' && (
                <>
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(val) => setFormData({...formData, dayOfWeek: val})}>
                      <SelectTrigger className="mt-1.5 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringStartTime">Start Time</Label>
                      <Input
                        id="recurringStartTime"
                        type="time"
                        value={formData.recurringStartTime}
                        onChange={(e) => setFormData({...formData, recurringStartTime: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recurringEndTime">End Time</Label>
                      <Input
                        id="recurringEndTime"
                        type="time"
                        value={formData.recurringEndTime}
                        onChange={(e) => setFormData({...formData, recurringEndTime: e.target.value})}
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Note */}
              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="mt-1.5 rounded-xl"
                  placeholder="Add any additional notes"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full rounded-xl">
                {saving ? 'Saving...' : 'Add Availability'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recurring Availability */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-gray-600" />
            <CardTitle>Weekly Schedule (Recurring)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recurringAvailability.length > 0 ? (
            <div className="space-y-3">
              {recurringAvailability.map((slot) => {
                const dayLabel = DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek.toString())?.label || 'Unknown';
                const typeConfig = AVAILABILITY_TYPES.find(t => t.value === slot.type);

                return (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">{dayLabel}</span>
                        <Badge className={typeConfig?.color}>{typeConfig?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {slot.note && (
                        <p className="text-xs text-gray-500 mt-1">{slot.note}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id, 'recurring')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recurring schedule set</p>
              <p className="text-sm text-gray-400 mt-1">
                Add recurring availability to set your weekly schedule
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* One-time Availability */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle>Specific Dates & Periods</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {oneTimeAvailability.length > 0 ? (
            <div className="space-y-3">
              {oneTimeAvailability.map((slot) => {
                const typeConfig = AVAILABILITY_TYPES.find(t => t.value === slot.type);
                const start = new Date(slot.start);
                const end = new Date(slot.end);

                return (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">
                          {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Badge className={typeConfig?.color}>{typeConfig?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {slot.note && (
                        <p className="text-xs text-gray-500 mt-1">{slot.note}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id, 'one-time')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No specific availability set</p>
              <p className="text-sm text-gray-400 mt-1">
                Add one-time availability for specific dates or periods
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
