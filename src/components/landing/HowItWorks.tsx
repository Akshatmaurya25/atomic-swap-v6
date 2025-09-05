'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Wallet,
  Bot,
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Wallet,
    title: "Connect Your Wallet",
    description: "Link your Web3 wallet and deposit funds to start trading. We support all major wallets and multiple chains.",
    features: ["MetaMask, WalletConnect, Coinbase Wallet", "Multi-chain support", "Secure connection"],
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20"
  },
  {
    icon: Bot,
    title: "Create Trading Bots",
    description: "Configure intelligent bots with your preferred strategies, risk tolerance, and trading parameters.",
    features: ["Arbitrage strategies", "Risk management", "Custom parameters"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20"
  },
  {
    icon: TrendingUp,
    title: "Earn Profits 24/7",
    description: "Your bots automatically identify opportunities and execute trades while you sleep, maximizing returns.",
    features: ["24/7 monitoring", "Automatic execution", "Real-time profits"],
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-800 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-800" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-6 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Simple Process</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Trading in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {" "}3 Easy Steps
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started with automated arbitrage trading in minutes. Our intuitive platform makes DeFi accessible to everyone.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-yellow-400" />
                  </div>
                )}
                
                <Card className={`${step.bgColor} border-2 ${step.borderColor} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
                  <CardContent className="p-8 text-center">
                    {/* Step Number */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 ${step.bgColor} border ${step.borderColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <CheckCircle className={`w-4 h-4 ${step.color}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h3>
              <p className="text-gray-300 mb-6">
                Join thousands of traders who are already earning passive income with our automated arbitrage bots.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-gray-800/50 rounded-lg px-6 py-3">
                  <span className="text-2xl font-bold text-green-400">$2.4M+</span>
                  <p className="text-sm text-gray-400">Total Profits Generated</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg px-6 py-3">
                  <span className="text-2xl font-bold text-yellow-400">12.3%</span>
                  <p className="text-sm text-gray-400">Average Monthly Returns</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg px-6 py-3">
                  <span className="text-2xl font-bold text-blue-400">3,500+</span>
                  <p className="text-sm text-gray-400">Active Users</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}