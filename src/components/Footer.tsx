
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-black py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Tenera Holistic & Wellness</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your trusted partner in holistic health and wellness. We provide premium quality products to support your journey to optimal health.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-700 hover:text-black transition-colors text-sm">Home</a></li>
              <li><a href="/products" className="text-gray-700 hover:text-black transition-colors text-sm">Products</a></li>
              <li><a href="/about" className="text-gray-700 hover:text-black transition-colors text-sm">About Us</a></li>
              <li><a href="/contact" className="text-gray-700 hover:text-black transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="/shipping" className="text-gray-700 hover:text-black transition-colors text-sm">Shipping Info</a></li>
              <li><a href="/returns" className="text-gray-700 hover:text-black transition-colors text-sm">Returns & Exchanges</a></li>
              <li><a href="/faq" className="text-gray-700 hover:text-black transition-colors text-sm">FAQ</a></li>
              <li><a href="/support" className="text-gray-700 hover:text-black transition-colors text-sm">Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gray-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700 text-sm">
                  123 Wellness Street<br />
                  Lagos, Nigeria
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-600 flex-shrink-0" />
                <p className="text-gray-700 text-sm">+234 123 456 7890</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-600 flex-shrink-0" />
                <p className="text-gray-700 text-sm">info@teneraholistic.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 Tenera Holistic & Wellness. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-600 hover:text-black transition-colors text-sm">Privacy Policy</a>
            <a href="/terms" className="text-gray-600 hover:text-black transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
