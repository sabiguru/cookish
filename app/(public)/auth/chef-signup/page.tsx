'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChefHat, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const steps = [
  { id: 1, title: 'Personal Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Experience & Skills', description: 'Your culinary background' },
  { id: 3, title: 'Service Details', description: 'What you offer' },
  { id: 4, title: 'Review & Submit', description: 'Confirm your application' },
];

export default function ChefSignupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    phone: '',
    bio: '',
    experience: '',
    specialties: '',
    cuisines: '',
    certifications: '',
    serviceRadius: '10',
    avgPrice: '',
  });

  // Check if user already has chef profile
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/chef/check')
        .then(res => res.json())
        .then(data => {
          if (data.hasProfile) {
            setHasProfile(true);
            router.push('/chef');
          }
        })
        .finally(() => setCheckingProfile(false));
    } else {
      setCheckingProfile(false);
    }
  }, [session, router]);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chef/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cuisineIds: [],
          dietTagIds: [],
          certifications: formData.certifications ? [{ name: formData.certifications }] : [],
          languages: ['English'],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Update session to include CHEF role
      await update();

      setSubmitted(true);

      // Redirect to chef dashboard after 2 seconds
      setTimeout(() => router.push('/chef'), 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ChefHat className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to apply as a chef</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <CardTitle>Application Submitted!</CardTitle>
            <CardDescription>
              Thank you for applying to become a chef on CookFort. Our admin team will review your application and you'll be notified once approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center mb-4">Redirecting to your chef dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <ChefHat className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Become a Chef</h1>
          <p className="text-gray-600">Join our community of professional chefs</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-500'
                  }`}>
                    {step.id}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-300'}`} />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-900">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+44 7700 900000"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Tell us about your culinary journey..."
                    rows={4}
                    className="mt-1.5"
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select value={formData.experience} onValueChange={(val) => updateField('experience', val)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cuisines">Cuisines You Specialize In *</Label>
                  <Input
                    id="cuisines"
                    value={formData.cuisines}
                    onChange={(e) => updateField('cuisines', e.target.value)}
                    placeholder="e.g., Italian, French, Japanese"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialties">Special Dishes/Techniques</Label>
                  <Textarea
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => updateField('specialties', e.target.value)}
                    placeholder="What makes your cooking unique?"
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications (Optional)</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => updateField('certifications', e.target.value)}
                    placeholder="Food safety, culinary school, etc."
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <Label htmlFor="serviceRadius">Travel Radius (km) *</Label>
                  <Select value={formData.serviceRadius} onValueChange={(val) => updateField('serviceRadius', val)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="30">30 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="avgPrice">Average Price Per Person (£) *</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    value={formData.avgPrice}
                    onChange={(e) => updateField('avgPrice', e.target.value)}
                    placeholder="50"
                    className="mt-1.5"
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-600">Name: {formData.fullName}</p>
                  <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Experience</h3>
                  <p className="text-sm text-gray-600">Years: {formData.experience}</p>
                  <p className="text-sm text-gray-600">Cuisines: {formData.cuisines}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p className="text-sm text-gray-600">Radius: {formData.serviceRadius} km</p>
                  <p className="text-sm text-gray-600">Price: £{formData.avgPrice}/person</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
