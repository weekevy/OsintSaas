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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-slide-up">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
              <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight">Integrations</h1>
            </div>
            <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Connect your favorite OSINT tools and services.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Global Config</span>
            </button>
          </div>
        </header>

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
