import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xl">
                🍔
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Foodie<span className="text-brand-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              FoodieHub connects food lovers with the finest artisanal kitchens and restaurants. Hot, fresh, and delivered with love right to your doorstep.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Discover</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link to="/restaurants" className="hover:text-brand-400 transition-colors">All Restaurants</Link></li>
              <li><Link to="/restaurants?cuisine=Pizza" className="hover:text-brand-400 transition-colors">Woodfired Pizza</Link></li>
              <li><Link to="/restaurants?cuisine=Sushi" className="hover:text-brand-400 transition-colors">Authentic Sushi</Link></li>
              <li><Link to="/restaurants?cuisine=Burgers" className="hover:text-brand-400 transition-colors">Smash Burgers</Link></li>
              <li><Link to="/offers" className="hover:text-brand-400 transition-colors">Deals & Coupons</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Account</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">My Past Orders</Link></li>
              <li><Link to="/admin" className="hover:text-brand-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Contact</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Guntur, Andhra Pradesh 522002</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span>+91 9492438966</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>support@foodiehub.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} FoodieHub Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for good food
            </span>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
