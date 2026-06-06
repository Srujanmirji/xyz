import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full py-stack-lg mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-stack-md">
        <div className="mb-stack-md md:mb-0">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            XYZ Homes
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
            © 2024 XYZ Homes. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8">
          <Link to="/privacy" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">
            Privacy Policy
          </Link>
          <Link to="/terms" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">
            Terms of Service
          </Link>
          <Link to="/contact" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">
            Contact Us
          </Link>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">public</span>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">share</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
