import { Cookie, Settings, Shield, BarChart } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy - CookFort',
  description: 'Learn about how CookFort uses cookies and similar technologies to improve your experience.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Cookie className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600">
            Understanding how we use cookies to enhance your experience
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: October 20, 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
            <p>
              CookFort uses cookies and similar tracking technologies to improve your browsing experience, analyze site traffic,
              personalize content, and serve targeted advertisements.
            </p>
          </div>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Essential Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function properly. They enable core functionality such as
                    security, network management, and accessibility.
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Examples:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-1">
                    <li>Authentication cookies (keeping you logged in)</li>
                    <li>Security cookies (protecting against fraud)</li>
                    <li>Session cookies (maintaining your preferences)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Duration:</strong> Session or up to 1 year
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
              <div className="flex items-start gap-3 mb-3">
                <BarChart className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Analytics & Performance Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting and reporting
                    information anonymously. This helps us improve our services.
                  </p>
                  <p className="text-sm text-gray-600 font-medium">What we track:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-1">
                    <li>Pages visited and time spent on pages</li>
                    <li>How you arrived at our site</li>
                    <li>What you clicked on during your visit</li>
                    <li>Device and browser information</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Third-party services:</strong> Google Analytics, Mixpanel
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                </div>
              </div>
            </div>

            {/* Functionality Cookies */}
            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
              <div className="flex items-start gap-3 mb-3">
                <Settings className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Functionality Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies enable personalized features and remember your preferences to enhance your experience.
                  </p>
                  <p className="text-sm text-gray-600 font-medium">What we remember:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-1">
                    <li>Language preferences</li>
                    <li>Region or country selection</li>
                    <li>Display preferences (e.g., font size)</li>
                    <li>Previous searches and favorites</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Duration:</strong> Up to 1 year
                  </p>
                </div>
              </div>
            </div>

            {/* Advertising Cookies */}
            <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-r-lg">
              <div className="flex items-start gap-3 mb-3">
                <Cookie className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Advertising & Targeting Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are used to deliver advertisements that are more relevant to you and your interests.
                    They also help limit the number of times you see an ad and measure the effectiveness of campaigns.
                  </p>
                  <p className="text-sm text-gray-600 font-medium">How we use them:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-1">
                    <li>Show relevant ads based on your interests</li>
                    <li>Prevent showing the same ad repeatedly</li>
                    <li>Measure ad campaign effectiveness</li>
                    <li>Track conversions and user actions</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Third-party services:</strong> Google Ads, Facebook Pixel, Twitter Ads
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              In addition to our own cookies, we may use third-party cookies to report usage statistics, deliver
              advertisements, and provide social media features.
            </p>
          </div>

          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Third-Party Services We Use:</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">Google Analytics</p>
                <p className="text-sm text-gray-600">For website analytics and performance tracking</p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  Google Privacy Policy →
                </a>
              </div>
              <div>
                <p className="font-medium text-gray-900">Stripe</p>
                <p className="text-sm text-gray-600">For secure payment processing</p>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  Stripe Privacy Policy →
                </a>
              </div>
              <div>
                <p className="font-medium text-gray-900">Social Media Platforms</p>
                <p className="text-sm text-gray-600">For social sharing and authentication (Google, Twitter, Apple)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences
              by adjusting your browser settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Settings</h3>
            <p className="mb-2">Most web browsers allow you to control cookies through their settings. Here's how:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
              </li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg mt-6">
              <p className="text-sm text-gray-700">
                <strong>Please note:</strong> Blocking or deleting cookies may affect your experience on CookFort.
                Some features may not work properly without essential cookies.
              </p>
            </div>
          </div>
        </section>

        {/* Do Not Track */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Do Not Track Signals</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Some browsers include a "Do Not Track" (DNT) feature that signals websites you visit that you do not want
              to have your online activity tracked. Currently, there is no universal standard for how DNT signals should
              be interpreted. CookFort does not currently respond to DNT signals.
            </p>
          </div>
        </section>

        {/* Updates */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed about
              our use of cookies.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions?</h2>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-lg">
            <p className="text-lg mb-4">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2">
              <p>Email: <a href="mailto:privacy@cookfort.com" className="underline font-semibold">privacy@cookfort.com</a></p>
              <p>Or visit our <a href="/contact" className="underline font-semibold">Contact Page</a></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
