'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'en',
  });

  // Fetch and load user profile data
  useEffect(() => {
    if (session?.user) {
      // Fetch full profile from API
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              language: data.user.language || 'en',
            });
          }
        })
        .catch(err => console.error('Failed to load profile:', err));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          language: formData.language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
        },
      });

      alert('Profile updated successfully!');

      // Refresh to update navbar
      router.refresh();
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" className="rounded-xl">
                  Change Photo
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF. Max 2MB
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10 rounded-xl"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10 rounded-xl"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="pl-10 rounded-xl"
                  placeholder="+44 7700 900000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your phone number is private and will only be used for booking confirmations and important account notifications. It will not be visible to the public.
              </p>
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language">Language</Label>
              <div className="relative mt-1.5">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                  <SelectTrigger className="pl-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {/* International Languages */}
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>

                    {/* African Languages */}
                    <SelectItem value="yo">Yoruba</SelectItem>
                    <SelectItem value="ig">Igbo</SelectItem>
                    <SelectItem value="ha">Hausa</SelectItem>
                    <SelectItem value="ur">Urhobo</SelectItem>
                    <SelectItem value="ij">Izon (Ijaw)</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="zu">Zulu</SelectItem>
                    <SelectItem value="xh">Xhosa</SelectItem>
                    <SelectItem value="am">Amharic</SelectItem>
                    <SelectItem value="om">Oromo</SelectItem>
                    <SelectItem value="so">Somali</SelectItem>
                    <SelectItem value="af">Afrikaans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="rounded-xl">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Connected Accounts - Coming Soon */}
      <Card className="rounded-2xl shadow-md opacity-60">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>Connected Accounts</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {['Google', 'Facebook', 'Twitter'].map((provider) => (
              <div key={provider} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-400">{provider[0]}</span>
                  </div>
                  <span className="font-medium text-gray-400">{provider}</span>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" disabled>
                  Connect
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Social account connections will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
