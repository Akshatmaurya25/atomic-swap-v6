'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingNavigationProps {
  onGetStarted: () => void;
}

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Docs', href: '/docs' },
  { name: 'Blog', href: '/blog' }
];

export function LandingNavigation({ onGetStarted }: LandingNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, authLoading } = useApp();
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // External link
      window.open(href, '_blank');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white">
              Yellow Network
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-300 hover:text-yellow-400 transition-colors text-sm lg:text-base font-medium"
              >
                {link.name}
                {!link.href.startsWith('#') && (
                  <ExternalLink className="w-3 h-3 ml-1 inline" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollToSection('#pricing')}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              View Pricing
            </Button>
            {!authLoading && isAuthenticated ? (
              <Button 
                onClick={handleDashboardClick}
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={onGetStarted}
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="flex items-center justify-between w-full text-left text-gray-300 hover:text-yellow-400 transition-colors py-2"
                  >
                    <span>{link.name}</span>
                    {!link.href.startsWith('#') && (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </button>
                ))}
                
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection('#pricing')}
                    className="w-full border-gray-600 text-white hover:bg-gray-800"
                  >
                    View Pricing
                  </Button>
                  {!authLoading && isAuthenticated ? (
                    <Button 
                      onClick={handleDashboardClick}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  ) : (
                    <Button 
                      onClick={onGetStarted}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}