'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Bot, 
  TrendingUp, 
  Shield, 
  Zap, 
  Eye, 
  Settings,
  Network,
  Clock,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Bot,
    title: "Intelligent Trading Bots",
    description: "Deploy AI-powered bots that automatically identify and execute profitable arbitrage opportunities across multiple chains.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Opportunities",
    description: "Monitor live price differences across DEXes and receive instant notifications when profitable trades become available.",
    color: "text-green-400",
    bgColor: "bg-green-400/10"
  },
  {
    icon: Network,
    title: "Cross-Chain Integration",
    description: "Seamlessly execute trades across Ethereum, Polygon, Arbitrum, and other major blockchain networks.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Bank-grade security with multi-signature wallets, smart contract audits, and comprehensive risk management.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10"
  },
  {
    icon: Eye,
    title: "Portfolio Analytics",
    description: "Comprehensive dashboard with real-time performance metrics, profit/loss tracking, and detailed trade history.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10"
  },
  {
    icon: Settings,
    title: "Customizable Strategies",
    description: "Create and fine-tune trading strategies with advanced parameters for slippage, gas limits, and risk management.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10"
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Sub-second trade execution with MEV protection and optimal routing to ensure maximum profitability.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10"
  },
  {
    icon: Clock,
    title: "24/7 Automation",
    description: "Never miss an opportunity with round-the-clock monitoring and automatic execution of profitable trades.",
    color: "text-green-400",
    bgColor: "bg-green-400/10"
  },
  {
    icon: Target,
    title: "Risk Management",
    description: "Built-in stop-loss mechanisms, position sizing, and risk assessment tools to protect your capital.",
    color: "text-red-400",
    bgColor: "bg-red-400/10"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900" />
      
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
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Powerful Features</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {" "}Successful Trading
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features needed to maximize your DeFi arbitrage profits with minimal risk.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 h-full group">
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}