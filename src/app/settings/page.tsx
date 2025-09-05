'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAccount } from 'wagmi';
import { 
  Settings,
  User,
  Shield,
  Bell,
  Zap,
  Wallet,
  Globe,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Key,
  Trash2,
  Plus,
  ExternalLink,
  AlertTriangle,
  Moon,
  Sun,
  Smartphone,
  Mail
} from 'lucide-react';
import { cn, truncateAddress } from '@/lib/utils';

interface UserSettings {
  profile: {
    displayName: string;
    email: string;
    timezone: string;
    language: string;
  };
  trading: {
    defaultSlippage: number;
    maxGasPrice: number;
    autoExecuteLimit: number;
    riskTolerance: 'low' | 'medium' | 'high';
    enableMEV: boolean;
    preferredChains: string[];
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    opportunities: boolean;
    botActions: boolean;
    priceAlerts: boolean;
    failedTrades: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    apiKeysEnabled: boolean;
    whitelistedIPs: string[];
  };
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    currency: 'USD' | 'EUR' | 'GBP';
    hideBalances: boolean;
    compactMode: boolean;
  };
}

const initialSettings: UserSettings = {
  profile: {
    displayName: 'Yellow Trader',
    email: 'trader@yellownetwork.io',
    timezone: 'UTC',
    language: 'en'
  },
  trading: {
    defaultSlippage: 1.0,
    maxGasPrice: 50,
    autoExecuteLimit: 1000,
    riskTolerance: 'medium',
    enableMEV: false,
    preferredChains: ['Ethereum', 'Polygon', 'Arbitrum']
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    opportunities: true,
    botActions: true,
    priceAlerts: false,
    failedTrades: true
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 24,
    apiKeysEnabled: false,
    whitelistedIPs: []
  },
  appearance: {
    theme: 'dark',
    currency: 'USD',
    hideBalances: false,
    compactMode: false
  }
};

export default function SettingsPage() {
  const { address } = useAccount();
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [activeSection, setActiveSection] = useState('profile');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newWhitelistIP, setNewWhitelistIP] = useState('');

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'trading', label: 'Trading', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Settings },
  ];

  const updateSettings = <K extends keyof UserSettings>(
    section: K,
    key: keyof UserSettings[K],
    value: unknown
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Here you would save to backend/localStorage
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
    // Show success message
  };

  const handleResetSettings = () => {
    setSettings(initialSettings);
    setUnsavedChanges(false);
  };

  const addWhitelistIP = () => {
    if (newWhitelistIP && !settings.security.whitelistedIPs.includes(newWhitelistIP)) {
      updateSettings('security', 'whitelistedIPs', [...settings.security.whitelistedIPs, newWhitelistIP]);
      setNewWhitelistIP('');
    }
  };

  const removeWhitelistIP = (ip: string) => {
    updateSettings('security', 'whitelistedIPs', settings.security.whitelistedIPs.filter(i => i !== ip));
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
          <Input
            value={settings.profile.displayName}
            onChange={(e) => updateSettings('profile', 'displayName', e.target.value)}
            placeholder="Enter display name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <Input
            type="email"
            value={settings.profile.email}
            onChange={(e) => updateSettings('profile', 'email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => updateSettings('profile', 'timezone', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
          <select
            value={settings.profile.language}
            onChange={(e) => updateSettings('profile', 'language', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      {/* Connected Wallet Info */}
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Connected Wallet</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <span className="font-mono text-sm text-gray-300">
              {address ? truncateAddress(address, 10, 10) : 'No wallet connected'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTradingSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Default Slippage (%)</label>
          <Input
            type="number"
            step="0.1"
            value={settings.trading.defaultSlippage}
            onChange={(e) => updateSettings('trading', 'defaultSlippage', parseFloat(e.target.value))}
            placeholder="1.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Gas Price (GWEI)</label>
          <Input
            type="number"
            value={settings.trading.maxGasPrice}
            onChange={(e) => updateSettings('trading', 'maxGasPrice', parseInt(e.target.value))}
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Auto Execute Limit ($)</label>
          <Input
            type="number"
            value={settings.trading.autoExecuteLimit}
            onChange={(e) => updateSettings('trading', 'autoExecuteLimit', parseInt(e.target.value))}
            placeholder="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
          <select
            value={settings.trading.riskTolerance}
            onChange={(e) => updateSettings('trading', 'riskTolerance', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">MEV Protection</h4>
            <p className="text-sm text-gray-400">Protect against MEV attacks</p>
          </div>
          <button
            onClick={() => updateSettings('trading', 'enableMEV', !settings.trading.enableMEV)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              settings.trading.enableMEV ? "bg-yellow-400" : "bg-gray-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                settings.trading.enableMEV ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* Preferred Chains */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Preferred Chains</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'BSC', 'Base'].map((chain) => (
            <button
              key={chain}
              onClick={() => {
                const current = settings.trading.preferredChains;
                const updated = current.includes(chain)
                  ? current.filter(c => c !== chain)
                  : [...current, chain];
                updateSettings('trading', 'preferredChains', updated);
              }}
              className={cn(
                "p-3 text-sm rounded-lg border transition-colors",
                settings.trading.preferredChains.includes(chain)
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                  : "border-gray-600 text-gray-400 hover:border-gray-500"
              )}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Notification Channels */}
        <h3 className="text-lg font-semibold text-white">Notification Channels</h3>
        
        {[
          { key: 'email', label: 'Email Notifications', icon: Mail },
          { key: 'push', label: 'Push Notifications', icon: Smartphone },
          { key: 'sms', label: 'SMS Notifications', icon: Bell },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 text-gray-400" />
              <span className="text-white">{label}</span>
            </div>
            <button
              onClick={() => updateSettings('notifications', key as keyof UserSettings['notifications'], !settings.notifications[key as keyof UserSettings['notifications']])}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                settings.notifications[key as keyof UserSettings['notifications']] ? "bg-yellow-400" : "bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings.notifications[key as keyof UserSettings['notifications']] ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      <hr className="border-gray-700" />

      {/* Event Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Event Notifications</h3>
        
        {[
          { key: 'opportunities', label: 'New Arbitrage Opportunities' },
          { key: 'botActions', label: 'Bot Status Changes' },
          { key: 'priceAlerts', label: 'Price Alerts' },
          { key: 'failedTrades', label: 'Failed Transactions' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-white">{label}</span>
            <button
              onClick={() => updateSettings('notifications', key as keyof UserSettings['notifications'], !settings.notifications[key as keyof UserSettings['notifications']])}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                settings.notifications[key as keyof UserSettings['notifications']] ? "bg-yellow-400" : "bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings.notifications[key as keyof UserSettings['notifications']] ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
              <h4 className="font-medium text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Add an extra layer of security</p>
            </div>
          </div>
          <Badge variant={settings.security.twoFactorEnabled ? "success" : "error"} size="sm">
            {settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <Button 
          variant={settings.security.twoFactorEnabled ? "outline" : "secondary"}
          size="sm"
          onClick={() => updateSettings('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
        >
          {settings.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>
      </div>

      {/* API Keys */}
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="font-medium text-white">API Access</h4>
              <p className="text-sm text-gray-400">Enable programmatic access</p>
            </div>
          </div>
          <Badge variant={settings.security.apiKeysEnabled ? "success" : "default"} size="sm">
            {settings.security.apiKeysEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        
        {settings.security.apiKeysEnabled && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Input
                type={showApiKey ? "text" : "password"}
                value="sk_test_1234567890abcdef"
                readOnly
                className="font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Key
              </Button>
              <Button variant="ghost" size="sm" className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Revoke
              </Button>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline"
          size="sm"
          onClick={() => updateSettings('security', 'apiKeysEnabled', !settings.security.apiKeysEnabled)}
          className="mt-3"
        >
          {settings.security.apiKeysEnabled ? 'Disable API Access' : 'Enable API Access'}
        </Button>
      </div>

      {/* Session Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (hours)</label>
        <Input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
          placeholder="24"
          className="max-w-xs"
        />
      </div>

      {/* IP Whitelist */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Whitelisted IP Addresses</label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              value={newWhitelistIP}
              onChange={(e) => setNewWhitelistIP(e.target.value)}
              placeholder="192.168.1.1"
              className="flex-1"
            />
            <Button onClick={addWhitelistIP} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {settings.security.whitelistedIPs.map((ip, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                <span className="font-mono text-sm text-white">{ip}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeWhitelistIP(ip)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'auto', label: 'Auto', icon: Globe },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateSettings('appearance', 'theme', value)}
              className={cn(
                "p-4 text-center rounded-lg border transition-colors",
                settings.appearance.theme === value
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-gray-600 hover:border-gray-500"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mx-auto mb-2",
                settings.appearance.theme === value ? "text-yellow-400" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                settings.appearance.theme === value ? "text-yellow-400" : "text-gray-400"
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Display Currency</label>
        <select
          value={settings.appearance.currency}
          onChange={(e) => updateSettings('appearance', 'currency', e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Other Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white">Hide Balances by Default</span>
            <p className="text-sm text-gray-400">Privacy mode for public displays</p>
          </div>
          <button
            onClick={() => updateSettings('appearance', 'hideBalances', !settings.appearance.hideBalances)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              settings.appearance.hideBalances ? "bg-yellow-400" : "bg-gray-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                settings.appearance.hideBalances ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-white">Compact Mode</span>
            <p className="text-sm text-gray-400">Reduce spacing and padding</p>
          </div>
          <button
            onClick={() => updateSettings('appearance', 'compactMode', !settings.appearance.compactMode)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              settings.appearance.compactMode ? "bg-yellow-400" : "bg-gray-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                settings.appearance.compactMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'trading': return renderTradingSection();
      case 'notifications': return renderNotificationsSection();
      case 'security': return renderSecuritySection();
      case 'appearance': return renderAppearanceSection();
      default: return renderProfileSection();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Manage your account preferences and trading settings
            </p>
          </div>
          
          {unsavedChanges && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors",
                        activeSection === section.id
                          ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(sections.find(s => s.id === activeSection)?.icon || Settings, { className: "w-5 h-5" })}
                <span>{sections.find(s => s.id === activeSection)?.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSectionContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}