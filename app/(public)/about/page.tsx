import Link from 'next/link';
import { ChefHat, Users, Shield, Award, Heart, Globe } from 'lucide-react';

export const metadata = {
  title: 'About Us - CookFort',
  description: 'Learn about CookFort, our mission, and how we connect talented chefs with food lovers.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About CookFort</h1>
          <p className="text-xl text-gray-600">
            Connecting talented chefs with food lovers for unforgettable culinary experiences
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            CookFort was born from a simple idea: everyone deserves access to exceptional, personalized culinary experiences.
            We noticed that while talented chefs existed everywhere, connecting them with people who appreciated their craft was difficult.
          </p>
          <p className="text-gray-600 mb-4">
            Founded in 2024, CookFort has grown into a vibrant community where professional chefs, home cooks, and food enthusiasts
            come together. Our platform makes it easy to book a personal chef for any occasion - from intimate dinners to large celebrations.
          </p>
          <p className="text-gray-600">
            Today, we serve thousands of customers across multiple regions, offering diverse cuisines and culinary styles.
            Every meal tells a story, and we're proud to be part of yours.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                We verify every chef on our platform to ensure they meet our high standards for food safety,
                culinary expertise, and professionalism.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We believe in building strong relationships between chefs and customers, fostering trust
                and creating lasting connections through food.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety & Trust</h3>
              <p className="text-gray-600">
                Your safety is our priority. All chefs undergo background checks, and we maintain strict
                food safety standards across our platform.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect - from the quality of our chefs to the seamlessness
                of our booking experience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Diversity</h3>
              <p className="text-gray-600">
                We celebrate culinary diversity, bringing together chefs from various backgrounds and
                cuisines from around the world.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empowerment</h3>
              <p className="text-gray-600">
                We empower chefs to build their businesses, set their own rates, and connect directly
                with customers who value their skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">CookFort by the Numbers</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
            <div className="text-gray-600">Verified Chefs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">50,000+</div>
            <div className="text-gray-600">Bookings Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
            <div className="text-gray-600">Cuisines Available</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience CookFort?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Whether you're looking to book a chef or become one, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chefs"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Find a Chef
            </Link>
            <Link
              href="/auth/signup"
              className="bg-orange-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-900 transition-colors"
            >
              Become a Chef
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
