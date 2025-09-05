'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Twitter, 
  Github, 
  MessageCircle, 
  Mail,
  ExternalLink,
  Bot
} from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Trading Bots', href: '/dashboard/bots' },
    { name: 'Opportunities', href: '/dashboard/opportunities' },
    { name: 'Analytics', href: '/dashboard/analytics' },
    { name: 'Portfolio', href: '/dashboard/portfolio' }
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'Blog', href: '/blog' },
    { name: 'Help Center', href: '/help' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Press Kit', href: '/press' }
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Security', href: '/security' }
  ]
};

const socialLinks = [
  { 
    name: 'Twitter', 
    href: 'https://twitter.com/yellownetwork', 
    icon: Twitter,
    color: 'hover:text-blue-400'
  },
  { 
    name: 'GitHub', 
    href: 'https://github.com/yellownetwork', 
    icon: Github,
    color: 'hover:text-gray-300'
  },
  { 
    name: 'Discord', 
    href: 'https://discord.gg/yellownetwork', 
    icon: MessageCircle,
    color: 'hover:text-purple-400'
  },
  { 
    name: 'Email', 
    href: 'mailto:support@yellownetwork.io', 
    icon: Mail,
    color: 'hover:text-yellow-400'
  }
];

interface FooterProps {
  onGetStarted: () => void;
}

export function Footer({ onGetStarted }: FooterProps) {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">
                Yellow Network
              </span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              The most advanced automated arbitrage trading platform for DeFi. 
              Maximize your returns with intelligent bots and real-time market analysis.
            </p>
            
            <Button 
              onClick={onGetStarted}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold mb-6"
            >
              Get Started Free
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-gray-800 text-gray-400 transition-colors ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links Sections */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Yellow Network. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              
              <div className="text-xs">
                Built with ❤️ for the DeFi community
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}