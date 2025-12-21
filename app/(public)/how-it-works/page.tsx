import { Metadata } from 'next';
import { Search, Calendar, CreditCard, Utensils, MessageCircle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works | CookFort',
  description: 'Learn how CookFort connects you with professional chefs for an unforgettable dining experience',
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: 'Browse & Select',
      description: 'Explore our curated selection of professional chefs, read reviews, and find the perfect match for your occasion.',
      details: [
        'Browse verified chef profiles',
        'View menus and specialties',
        'Read customer reviews and ratings',
        'Check chef availability',
      ],
    },
    {
      icon: Calendar,
      title: 'Book & Customize',
      description: 'Choose your date, number of guests, and discuss your preferences and dietary requirements directly with your chef.',
      details: [
        'Select your preferred date and time',
        'Specify number of guests',
        'Discuss dietary restrictions',
        'Customize your menu',
      ],
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Complete your booking with our secure payment system. Your payment is only released to the chef after your event.',
      details: [
        'Pay securely online',
        'Payment held in escrow',
        'Released after successful event',
        'Full refund protection',
      ],
    },
    {
      icon: Utensils,
      title: 'Enjoy Your Experience',
      description: 'Relax as your chef arrives with ingredients, prepares the meal, serves each course, and cleans up afterward.',
      details: [
        'Chef arrives with fresh ingredients',
        'Meal prepared in your kitchen',
        'Professional table service',
        'Complete cleanup included',
      ],
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Chefs',
      description: 'All our chefs are professionally verified and background-checked for your safety.',
    },
    {
      icon: MessageCircle,
      title: 'Direct Communication',
      description: 'Chat directly with your chef to customize every detail of your dining experience.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Your payment is protected and only released after your successful event.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From finding your perfect chef to enjoying a restaurant-quality meal at home, our process is simple and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col">
                    {/* Step Number Badge */}
                    <div className="flex items-start mb-6">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="bg-gray-900 text-white rounded-full p-4">
                            <step.icon className="h-8 w-8" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-gray-700">
                              <svg
                                className="h-5 w-5 text-green-500 mr-2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose CookFort?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make it easy and safe to connect with professional chefs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="bg-gray-900 text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Book your perfect chef today and experience restaurant-quality dining at home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/chefs"
                className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl"
              >
                Find Your Chef
              </a>
              <a
                href="/contact"
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
