import { Shield, AlertTriangle, CheckCircle, UserCheck, Home, FileCheck, Heart, Phone } from 'lucide-react';

export const metadata = {
  title: 'Safety Guidelines - CookFort',
  description: 'Stay safe on CookFort. Learn about our safety measures and best practices for both chefs and customers.',
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Safety Guidelines</h1>
          <p className="text-xl text-gray-600">
            Your safety is our top priority. Learn how we keep our community safe.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-600">
            At CookFort, we are committed to maintaining a safe and trustworthy platform for both chefs and customers.
            Please review these safety guidelines to ensure a secure experience for everyone.
          </p>
        </div>

        {/* For Customers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-600" />
            For Customers
          </h2>

          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Book Verified Chefs</h3>
              <p className="text-gray-700 mb-2">
                All chefs on CookFort undergo a thorough verification process including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Identity verification</li>
                <li>Background checks</li>
                <li>Food safety certifications</li>
                <li>Professional references</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Check Reviews & Ratings</h3>
              <p className="text-gray-700">
                Always read reviews from previous customers. Look for chefs with consistent positive feedback
                and verified bookings. Pay attention to comments about cleanliness, professionalism, and food quality.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Communicate Through the Platform</h3>
              <p className="text-gray-700">
                Keep all communication within CookFort's messaging system. This protects both parties and provides
                a record of your conversations. Never share personal contact information before booking.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prepare Your Space</h3>
              <p className="text-gray-700 mb-2">
                Before the chef arrives:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Ensure your kitchen is clean and accessible</li>
                <li>Verify all necessary equipment is available</li>
                <li>Inform the chef of any dietary restrictions or allergies</li>
                <li>Have someone present during the service</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust Your Instincts</h3>
              <p className="text-gray-700">
                If something doesn't feel right, contact CookFort support immediately. We're here 24/7 to help
                resolve any concerns or safety issues.
              </p>
            </div>
          </div>
        </section>

        {/* For Chefs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Home className="h-8 w-8 text-orange-600" />
            For Chefs
          </h2>

          <div className="space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Maintain Certifications</h3>
              <p className="text-gray-700 mb-2">
                Keep all required certifications current:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Food handler's permit</li>
                <li>Food safety certification</li>
                <li>Liability insurance (required for all chefs)</li>
                <li>Any local or state-specific licenses</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Screen Your Bookings</h3>
              <p className="text-gray-700">
                Review customer profiles before accepting bookings. Check their reviews, booking history,
                and communication. You have the right to decline any booking that makes you uncomfortable.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Follow Food Safety Protocols</h3>
              <p className="text-gray-700 mb-2">
                Always adhere to proper food safety standards:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Maintain proper food temperatures</li>
                <li>Practice good hygiene and handwashing</li>
                <li>Prevent cross-contamination</li>
                <li>Use fresh, quality ingredients</li>
                <li>Properly store and handle food</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Assess the Environment</h3>
              <p className="text-gray-700">
                Upon arrival, assess the kitchen for safety. Ensure you have adequate workspace, proper equipment,
                and a safe cooking environment. If conditions are unsafe, you may cancel the booking.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Preparedness</h3>
              <p className="text-gray-700">
                Know the location of fire extinguishers, first aid kits, and emergency exits. Keep your phone
                accessible and have emergency contacts readily available.
              </p>
            </div>
          </div>
        </section>

        {/* Health & Hygiene */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-600" />
            Health & Hygiene
          </h2>

          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">COVID-19 Precautions</h3>
              <p className="text-gray-700 mb-2">
                We continue to prioritize health safety:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Chefs must follow local health guidelines</li>
                <li>Wear masks when required or requested</li>
                <li>Practice social distancing when possible</li>
                <li>Frequently sanitize hands and surfaces</li>
                <li>Stay home if feeling unwell</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Allergy Awareness</h3>
              <p className="text-gray-700">
                Chefs must take all allergy information seriously. Always ask about dietary restrictions,
                read ingredient labels carefully, and prevent cross-contamination. When in doubt, ask the customer.
              </p>
            </div>
          </div>
        </section>

        {/* Reporting Issues */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            Reporting Safety Concerns
          </h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
            <p className="text-gray-700 mb-4">
              If you experience or witness any safety concerns, suspicious behavior, or policy violations,
              please report it immediately:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold">Emergency Hotline:</span>
                <span className="text-gray-700">1-800-COOKFORT (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold">Email:</span>
                <span className="text-gray-700">safety@cookfort.com</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              In case of immediate danger, always call local emergency services (911) first.
            </p>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            General Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">✓ Do's</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Keep bookings on the platform</li>
                <li>• Communicate clearly and professionally</li>
                <li>• Follow cancellation policies</li>
                <li>• Leave honest reviews</li>
                <li>• Report suspicious activity</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">✗ Don'ts</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Don't share personal financial information</li>
                <li>• Don't accept payments outside the platform</li>
                <li>• Don't ignore red flags</li>
                <li>• Don't leave negative reviews as retaliation</li>
                <li>• Don't violate platform policies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Questions About Safety?</h3>
          <p className="mb-6 text-blue-100">
            Our support team is available 24/7 to address your safety concerns.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
