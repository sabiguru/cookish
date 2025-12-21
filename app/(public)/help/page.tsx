'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Users, ChefHat, CreditCard, Calendar, Shield, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      icon: Users,
      title: 'Getting Started',
      color: 'blue',
      link: '#getting-started',
    },
    {
      icon: ChefHat,
      title: 'For Chefs',
      color: 'orange',
      link: '#for-chefs',
    },
    {
      icon: Calendar,
      title: 'Bookings',
      color: 'green',
      link: '#bookings',
    },
    {
      icon: CreditCard,
      title: 'Payments',
      color: 'purple',
      link: '#payments',
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      color: 'red',
      link: '#safety',
    },
    {
      icon: MessageCircle,
      title: 'Account & Support',
      color: 'yellow',
      link: '#account',
    },
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I create an account on CookFort?',
        answer: 'Click the "Sign Up" button in the navigation bar. You can sign up using your email, phone number, or through social login options (Google, Apple, or X). After signing up, you\'ll receive a verification link to activate your account.',
      },
      {
        question: 'Is CookFort available in my area?',
        answer: 'CookFort is currently available in major cities across the United States, Canada, and select European countries. Enter your location on our homepage to see available chefs in your area.',
      },
      {
        question: 'How does CookFort work?',
        answer: 'CookFort connects you with professional chefs for personalized dining experiences. Browse chef profiles, view their menus and reviews, select a date and time, and book directly through our platform. The chef will come to your location to prepare your meal.',
      },
    ],
    'for-chefs': [
      {
        question: 'How do I become a chef on CookFort?',
        answer: 'Sign up as a chef, complete your profile with certifications and experience, upload photos of your dishes, and pass our verification process. You\'ll need valid food safety certifications and liability insurance to get approved.',
      },
      {
        question: 'What certifications do I need?',
        answer: 'You need a valid food handler\'s permit, food safety certification, and liability insurance. Some regions may require additional local licenses. Upload all certifications during the registration process.',
      },
      {
        question: 'How do I set my rates?',
        answer: 'You have complete control over your pricing. Set your hourly rate, minimum booking duration, and any additional fees for ingredients or travel. You can adjust your rates at any time from your chef dashboard.',
      },
      {
        question: 'When do I get paid?',
        answer: 'Payments are released 24 hours after the completed booking. Funds are transferred directly to your bank account via Stripe. You can track all your earnings in the Payouts section of your dashboard.',
      },
    ],
    'bookings': [
      {
        question: 'How do I book a chef?',
        answer: 'Browse available chefs, select the one you like, choose a date and time, specify the number of guests, and confirm your booking. You\'ll receive instant confirmation and can communicate with the chef through our messaging system.',
      },
      {
        question: 'Can I cancel or reschedule a booking?',
        answer: 'Yes, you can cancel or reschedule through your bookings page. Cancellation policies vary by chef, but typically: full refund if canceled 48+ hours before, 50% refund if canceled 24-48 hours before, and no refund if canceled within 24 hours.',
      },
      {
        question: 'What if the chef cancels?',
        answer: 'If a chef cancels, you\'ll receive a full refund immediately. We\'ll also help you find a replacement chef if your booking is time-sensitive. Chef cancellations are rare and may result in penalties for the chef.',
      },
      {
        question: 'Can I make dietary requests?',
        answer: 'Absolutely! During booking, specify any dietary restrictions, allergies, or preferences. You can also message the chef directly to discuss menu customizations.',
      },
    ],
    'payments': [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and digital wallets through our secure payment processor, Stripe.',
      },
      {
        question: 'When am I charged?',
        answer: 'Your card is charged immediately upon booking confirmation. The funds are held securely and released to the chef 24 hours after the completed service.',
      },
      {
        question: 'Are there any additional fees?',
        answer: 'CookFort charges a service fee (typically 10-15% of the booking total) to cover platform costs and customer support. Chefs may also charge for ingredients or travel, which will be clearly shown before you confirm.',
      },
      {
        question: 'How do refunds work?',
        answer: 'Refunds are processed according to the cancellation policy. Approved refunds are returned to your original payment method within 5-10 business days.',
      },
    ],
    'safety': [
      {
        question: 'How do you verify chefs?',
        answer: 'All chefs undergo identity verification, background checks, certification reviews, and reference checks. We verify food safety certifications and insurance before approving any chef profile.',
      },
      {
        question: 'What if I have a safety concern?',
        answer: 'Contact our 24/7 safety hotline immediately at 1-800-COOKFORT or email safety@cookfort.com. For immediate danger, always call local emergency services (911) first.',
      },
      {
        question: 'Are chefs insured?',
        answer: 'Yes, all chefs must carry liability insurance to work on CookFort. This protects both the chef and the customer in case of any incidents.',
      },
      {
        question: 'How do you handle allergies?',
        answer: 'Chefs are required to take all allergy information seriously. Always communicate allergies clearly during booking and remind the chef before service. Chefs must prevent cross-contamination and verify ingredient labels.',
      },
    ],
    'account': [
      {
        question: 'How do I reset my password?',
        answer: 'CookFort uses passwordless authentication. Simply enter your email or phone number on the sign-in page, and we\'ll send you a secure login link. No password needed!',
      },
      {
        question: 'How do I update my profile?',
        answer: 'Go to your dashboard and click on "Profile" or "Settings". You can update your personal information, contact details, payment methods, and preferences.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings → Account → Delete Account. Please note this action is permanent and will remove all your data, bookings history, and reviews.',
      },
      {
        question: 'How can I contact support?',
        answer: 'You can reach our support team via email at support@cookfort.com, call us at 1-800-COOKFORT, or use the contact form on our Contact page. We\'re available 24/7 to help!',
      },
    ],
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions or get in touch with our support team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const colors: Record<string, string> = {
                blue: 'bg-blue-100 text-blue-600',
                orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                red: 'bg-red-100 text-red-600',
                yellow: 'bg-yellow-100 text-yellow-600',
              };

              return (
                <a
                  key={index}
                  href={category.link}
                  className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 ${colors[category.color]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </a>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

          {Object.entries(faqs).map(([categoryId, questions]) => {
            const categoryTitle = categories.find(c => c.link.includes(categoryId))?.title || categoryId;

            return (
              <div key={categoryId} id={categoryId} className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{categoryTitle}</h3>
                <div className="space-y-4">
                  {questions.map((faq, index) => {
                    const globalIndex = Object.keys(faqs).reduce((acc, key) => {
                      if (key === categoryId) return acc;
                      return acc + faqs[key as keyof typeof faqs].length;
                    }, 0) + index;

                    const isExpanded = expandedFaq === globalIndex;

                    return (
                      <div
                        key={globalIndex}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Still Need Help */}
        <section className="mt-16">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 md:p-12 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg mb-8 text-blue-100">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@cookfort.com"
                className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors inline-block"
              >
                Email Us
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Call us at: <span className="font-semibold">1-800-COOKFORT</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
