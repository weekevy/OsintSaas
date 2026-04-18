  import { useState } from 'react';
  import {
    IntegrationCard,
    AvailableIntegrations,
    ConnectedServices,
    WebhookConfig,
    APIKeys
  } from '../integrations';

  const IntegrationsDashboard = () => {
    const [activeTab, setActiveTab] = useState('connected');
    const [isConfiguring, setIsConfiguring] = useState(null);

    const connectedIntegrations = [
      {
        id: 1,
        name: 'VirusTotal',
        description: 'Malware and threat intelligence',
        icon: '🛡️',
        status: 'active',
        lastSync: '2 min ago',
        usage: '45%'
      },
      {
        id: 2,
        name: 'AlienVault OTX',
        description: 'Open threat exchange',
        icon: '👽',
        status: 'active',
        lastSync: '15 min ago',
        usage: '30%'
      },
      {
        id: 3,
        name: 'Shodan',
        description: 'Internet device search engine',
        icon: '🔍',
        status: 'error',
        lastSync: '1 hour ago',
        usage: '0%'
      }
    ];

    const availableIntegrations = [
      {
        id: 4,
        name: 'Greynoise',
        description: 'Internet noise analysis',
        icon: '🌐',
        category: 'Threat Intel',
        popularity: 'high'
      },
      {
        id: 5,
        name: 'AbuseIPDB',
        description: 'IP address reputation',
        icon: '🚫',
        category: 'Reputation',
        popularity: 'high'
      },
      {
        id: 6,
        name: 'UrlScan.io',
        description: 'Website scanner',
        icon: '🔗',
        category: 'Analysis',
        popularity: 'medium'
      },
      {
        id: 7,
        name: 'Hybrid Analysis',
        description: 'Sandbox analysis',
        icon: '🔬',
        category: 'Analysis',
        popularity: 'medium'
      },
      {
        id: 8,
        name: 'MISP',
        description: 'Threat sharing platform',
        icon: '🔄',
        category: 'Threat Intel',
        popularity: 'high'
      },
      {
        id: 9,
        name: 'TheHive',
        description: 'Incident response',
        icon: '🏠',
        category: 'Response',
        popularity: 'medium'
      }
    ];

    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              Integrations
            </h1>
            <p className="text-white/60 text-sm lg:text-base mt-1">
              Connect your favorite OSINT tools and services
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          {['connected', 'available', 'webhooks', 'api-keys'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all
                ${activeTab === tab 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'connected' && (
          <ConnectedServices 
            integrations={connectedIntegrations}
            onConfigure={setIsConfiguring}
          />
        )}

        {activeTab === 'available' && (
          <AvailableIntegrations 
            integrations={availableIntegrations}
            onConnect={setIsConfiguring}
          />
        )}

        {activeTab === 'webhooks' && (
          <WebhookConfig />
        )}

        {activeTab === 'api-keys' && (
          <APIKeys />
        )}
      </div>
    );
  };

  export default IntegrationsDashboard;
