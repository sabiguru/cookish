'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

interface MenuFormProps {
  menu?: {
    id: string;
    title: string;
    description: string;
    pricePerPerson: number;
    servingSize?: string | null;
    preparationTime?: number | null;
    courses?: any;
    cuisines: Array<{ id: string; name: string }>;
  };
  availableCuisines: Array<{ id: string; name: string }>;
}

export default function MenuForm({ menu, availableCuisines }: MenuFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: menu?.title || '',
    description: menu?.description || '',
    pricePerPerson: menu?.pricePerPerson || 0,
    servingSize: menu?.servingSize || '',
    preparationTime: menu?.preparationTime || 0,
    selectedCuisines: menu?.cuisines.map((c) => c.id) || [],
    courses: menu?.courses || [],
  });

  const [courses, setCourses] = useState<Array<{ name: string; items: string[] }>>(
    menu?.courses || [{ name: '', items: [''] }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = menu
        ? `/api/chef/menus/${menu.id}`
        : '/api/chef/menus';

      const method = menu ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courses,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/chef/menus');
        router.refresh();
      } else {
        console.error('Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCuisineToggle = (cuisineId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCuisines: prev.selectedCuisines.includes(cuisineId)
        ? prev.selectedCuisines.filter((id) => id !== cuisineId)
        : [...prev.selectedCuisines, cuisineId],
    }));
  };

  const addCourse = () => {
    setCourses([...courses, { name: '', items: [''] }]);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourseName = (index: number, name: string) => {
    const updated = [...courses];
    updated[index].name = name;
    setCourses(updated);
  };

  const addCourseItem = (courseIndex: number) => {
    const updated = [...courses];
    updated[courseIndex].items.push('');
    setCourses(updated);
  };

  const removeCourseItem = (courseIndex: number, itemIndex: number) => {
    const updated = [...courses];
    updated[courseIndex].items = updated[courseIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setCourses(updated);
  };

  const updateCourseItem = (
    courseIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const updated = [...courses];
    updated[courseIndex].items[itemIndex] = value;
    setCourses(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">Menu Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="rounded-xl"
              placeholder="e.g., Traditional Italian 5-Course Dinner"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              className="rounded-xl"
              rows={4}
              placeholder="Describe your menu in detail..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerPerson">Price per Person ($) *</Label>
              <Input
                id="pricePerPerson"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerPerson: parseFloat(e.target.value),
                  })
                }
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="servingSize">Serving Size</Label>
              <Input
                id="servingSize"
                value={formData.servingSize}
                onChange={(e) =>
                  setFormData({ ...formData, servingSize: e.target.value })
                }
                className="rounded-xl"
                placeholder="e.g., 1 person"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
            <Input
              id="preparationTime"
              type="number"
              min="0"
              value={formData.preparationTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preparationTime: parseInt(e.target.value),
                })
              }
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Cuisines</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {availableCuisines.map((cuisine) => (
              <div key={cuisine.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine.id}
                  checked={formData.selectedCuisines.includes(cuisine.id)}
                  onCheckedChange={() => handleCuisineToggle(cuisine.id)}
                />
                <label
                  htmlFor={cuisine.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {cuisine.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle>Courses</CardTitle>
          <Button
            type="button"
            onClick={addCourse}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Course
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {courses.map((course, courseIndex) => (
            <div
              key={courseIndex}
              className="border rounded-xl p-4 space-y-4 relative"
            >
              {courses.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeCourse(courseIndex)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 rounded-lg text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div>
                <Label htmlFor={`course-name-${courseIndex}`}>
                  Course Name
                </Label>
                <Input
                  id={`course-name-${courseIndex}`}
                  value={course.name}
                  onChange={(e) =>
                    updateCourseName(courseIndex, e.target.value)
                  }
                  className="rounded-xl"
                  placeholder="e.g., Appetizer, Main Course, Dessert"
                />
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                {course.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateCourseItem(courseIndex, itemIndex, e.target.value)
                      }
                      className="rounded-xl"
                      placeholder="e.g., Bruschetta with tomatoes"
                    />
                    {course.items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCourseItem(courseIndex, itemIndex)}
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addCourseItem(courseIndex)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl"
        >
          {isSubmitting
            ? 'Saving...'
            : menu
            ? 'Update Menu'
            : 'Create Menu'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
