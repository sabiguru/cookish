import Link from 'next/link';
import { ChefHat, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-bold">CookFort</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connecting talented chefs with customers for unforgettable dining experiences.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Discover</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/chefs" className="text-gray-400 hover:text-white transition text-sm">
                  Find a Chef
                </Link>
              </li>
              <li>
                <Link href="/cuisines" className="text-gray-400 hover:text-white transition text-sm">
                  Browse Cuisines
                </Link>
              </li>
              <li>
                <Link href="/occasions" className="text-gray-400 hover:text-white transition text-sm">
                  Occasions
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-gray-400 hover:text-white transition text-sm">
                  Offers & Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-400 hover:text-white transition text-sm">
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CookFort. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-gray-400 hover:text-white transition">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition">
              Privacy
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
