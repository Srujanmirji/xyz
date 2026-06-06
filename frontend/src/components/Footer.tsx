import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if we should show the CTA section
  const showCTA = 
    pathname === '/' || 
    pathname === '/properties' || 
    pathname === '/contact' || 
    pathname.startsWith('/properties/');

  return (
    <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/30 w-full relative mt-auto">
      {/* 1. Integrated CTA Section */}
      {showCTA && (
        <div className="max-w-container-max mx-auto px-gutter -translate-y-12 relative z-10 mb-[-24px]">
          <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-container text-on-primary-container rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/20">
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary-container/20 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-2xl space-y-3">
                <span className="bg-white/10 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-white/10">
                  Ready to Start Your Journey?
                </span>
                <h2 className="font-headline-lg text-[26px] md:text-[34px] font-bold text-white leading-tight">
                  Find Your Next Luxury Address
                </h2>
                <p className="font-body-md text-sm md:text-base text-white/80 max-w-lg leading-relaxed">
                  Our advisor network is standing by to help you schedule private visits, analyze custom mortgage terms, or sell your property.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0 justify-center">
                <button
                  onClick={() => navigate('/properties')}
                  className="bg-white text-primary hover:bg-surface-bright font-bold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Browse Listings
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-transparent border border-white/30 hover:border-white text-white font-bold px-8 py-3.5 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Contact an Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Footer Layout */}
      <div className={`max-w-container-max mx-auto px-gutter pb-12 ${showCTA ? 'pt-8 md:pt-12' : 'pt-16'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-outline-variant/20">
          
          {/* Brand & Newsletter Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <Link to="/" className="font-headline-md text-[22px] font-black text-primary tracking-tight inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[26px]">domain</span>
                XYZ Homes
              </Link>
              <p className="font-body-md text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Curating modern, high-end living spaces with custom architectural intelligence and seamless transaction services.
              </p>
            </div>
            
            {/* Newsletter form */}
            <div className="space-y-3 max-w-sm">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Stay Updated
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-surface-container-low border border-outline-variant/30 text-xs text-on-background px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-1"
                >
                  {subscribed ? 'Joined!' : 'Subscribe'}
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-primary font-medium animate-pulse">
                  Thank you! You have successfully subscribed to our weekly newsletter.
                </p>
              )}
            </div>
          </div>

          {/* Links Column 1: Explore */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties?type=Villa" className="text-on-surface-variant hover:text-primary transition-colors">Villas</Link>
              </li>
              <li>
                <Link to="/properties?type=Apartment" className="text-on-surface-variant hover:text-primary transition-colors">Apartments</Link>
              </li>
              <li>
                <Link to="/properties?type=Penthouse" className="text-on-surface-variant hover:text-primary transition-colors">Penthouses</Link>
              </li>
              <li>
                <Link to="/properties?type=House" className="text-on-surface-variant hover:text-primary transition-colors">Houses</Link>
              </li>
              <li>
                <Link to="/properties" className="text-on-surface-variant hover:text-primary transition-colors font-medium">All Listings</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Company */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/properties" className="text-on-surface-variant hover:text-primary transition-colors">Our Agents</Link>
              </li>
              <li>
                <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors">Press room</Link>
              </li>
              <li>
                <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors font-medium">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Contact & Legal */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">mail</span>
                <span>info@xyzhomes.com</span>
              </li>
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">phone</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">location_on</span>
                <span>90210 Crestview Dr, Los Angeles, CA</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Bottom Copyright & Socials */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-on-surface-variant text-center md:text-left">
            <span>© {new Date().getFullYear()} XYZ Homes. All rights reserved.</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link to="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-primary transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-primary transition-colors">Cookie Settings</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex gap-2.5">
              <a href="#" className="w-8 h-8 rounded-full border border-outline-variant/30 hover:border-primary hover:text-primary text-on-surface-variant flex items-center justify-center transition-all duration-300 hover:scale-105">
                <span className="material-symbols-outlined text-[16px]">public</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-outline-variant/30 hover:border-primary hover:text-primary text-on-surface-variant flex items-center justify-center transition-all duration-300 hover:scale-105">
                <span className="material-symbols-outlined text-[16px]">share</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-outline-variant/30 hover:border-primary hover:text-primary text-on-surface-variant flex items-center justify-center transition-all duration-300 hover:scale-105">
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </a>
            </div>

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-xs font-label-md text-on-surface-variant hover:text-primary transition-all duration-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              Back to Top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
