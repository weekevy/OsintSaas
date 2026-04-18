import { useState } from 'react';

const APITokens = () => {
  const [tokens, setTokens] = useState([
    {
      id: 1,
      name: 'PRODUCTION API TOKEN',
      token: 'ow_live_2x7f9k3m1q5p8v4n2r6t9y1w3z5x7c9v',
      created: '2024-01-15',
      expires: '2025-01-15',
      lastUsed: '2 MIN AGO',
      permissions: ['read', 'write', 'delete'],
      status: 'active'
    },
    {
      id: 2,
      name: 'DEVELOPMENT TOKEN',
      token: 'ow_dev_3y8g6h2j4k7l1m9n5p8r2t6w9z4x7c1v',
      created: '2024-02-20',
      expires: '2025-02-20',
      lastUsed: '1 HOUR AGO',
      permissions: ['read', 'write'],
      status: 'active'
    },
    {
      id: 3,
      name: 'ANALYTICS INTEGRATION',
      token: 'ow_analytics_4z9h7j3k6l2m8n4p1r5t9w2x6c8v3b',
      created: '2024-03-01',
      expires: '2024-06-01',
      lastUsed: '3 DAYS AGO',
      permissions: ['read'],
      status: 'expiring'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState('30');
  const [newTokenPermissions, setNewTokenPermissions] = useState(['read']);

  const createToken = () => {
    const newToken = {
      id: tokens.length + 1,
      name: newTokenName.toUpperCase(),
      token: `ow_${Math.random().toString(36).substr(2, 32)}`,
      created: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + parseInt(newTokenExpiry) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastUsed: 'NEVER',
      permissions: newTokenPermissions,
      status: 'active'
    };
    setTokens([...tokens, newToken]);
    setShowCreateForm(false);
    setNewTokenName('');
    setNewTokenPermissions(['read']);
  };

  const revokeToken = (id) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'border-[#34d399]/30 text-[#34d399]';
      case 'expiring': return 'border-[#fbbf24]/30 text-[#fbbf24]';
      case 'expired': return 'border-[#f87171]/30 text-[#f87171]';
      default: return 'border-white/20 text-white/40';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em]">API TOKENS</h3>
          <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">MANAGE AUTHENTICATION TOKENS FOR API ACCESS</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[8px] font-mono uppercase tracking-[0.08em] flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          GENERATE TOKEN
        </button>
      </div>

      {/* Create Token Form */}
      {showCreateForm && (
        <div className="bg-[#090c0e] border border-white/10 p-5 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          
          <h4 className="text-white font-mono text-[9px] font-bold uppercase tracking-[0.12em] mb-4">GENERATE NEW API TOKEN</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-[7px] font-mono uppercase tracking-[0.12em] mb-1">TOKEN NAME</label>
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                placeholder="e.g., PRODUCTION, DEVELOPMENT"
              />
            </div>

            <div>
              <label className="block text-white/40 text-[7px] font-mono uppercase tracking-[0.12em] mb-1">EXPIRATION</label>
              <select
                value={newTokenExpiry}
                onChange={(e) => setNewTokenExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[9px] font-mono uppercase tracking-[0.08em] focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              >
                <option value="7">7 DAYS</option>
                <option value="30">30 DAYS</option>
                <option value="90">90 DAYS</option>
                <option value="365">1 YEAR</option>
                <option value="0">NEVER EXPIRES</option>
              </select>
            </div>

            <div>
              <label className="block text-white/40 text-[7px] font-mono uppercase tracking-[0.12em] mb-2">PERMISSIONS</label>
              <div className="flex flex-wrap gap-3">
                {['read', 'write', 'delete', 'admin'].map((permission) => (
                  <label key={permission} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTokenPermissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewTokenPermissions([...newTokenPermissions, permission]);
                        } else {
                          setNewTokenPermissions(newTokenPermissions.filter(p => p !== permission));
                        }
                      }}
                      className="w-3 h-3 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0"
                    />
                    <span className="text-white/60 text-[8px] font-mono uppercase tracking-[0.08em]">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 py-1.5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[8px] font-mono uppercase tracking-[0.08em]"
              >
                CANCEL
              </button>
              <button
                onClick={createToken}
                disabled={!newTokenName}
                className="flex-1 px-3 py-1.5 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[8px] font-mono uppercase tracking-[0.08em] disabled:opacity-50"
              >
                GENERATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-2">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="bg-[#090c0e] border border-white/10 p-4 hover:border-[#00ff88]/30 transition-all relative group"
          >
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-mono text-[9px] font-bold uppercase tracking-[0.08em]">{token.name}</h4>
                  <span className={`px-1.5 py-0.5 text-[6px] font-mono uppercase tracking-[0.1em] border ${getStatusColor(token.status)}`}>
                    {token.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <code className="bg-[#0d1114] px-2 py-1 text-white/60 font-mono text-[8px]">
                      {token.token.substring(0, 20)}...{token.token.substring(token.token.length - 10)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(token.token)}
                      className="p-1 text-white/30 hover:text-[#00ff88] transition-all"
                      title="Copy full token"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[7px] font-mono uppercase tracking-[0.08em]">
                    <span className="text-white/30">CREATED: <span className="text-white/50">{token.created}</span></span>
                    <span className="text-white/30">EXPIRES: <span className={`${token.status === 'expiring' ? 'text-[#fbbf24]' : 'text-white/50'}`}>{token.expires}</span></span>
                    <span className="text-white/30">LAST USED: <span className="text-white/50">{token.lastUsed}</span></span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/30">PERMISSIONS:</span>
                      {token.permissions.map((perm) => (
                        <span key={perm} className="px-1 py-0.5 border border-[#00ff88]/30 text-[#00ff88] text-[6px] font-mono uppercase tracking-[0.08em]">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-3">
                <button className="p-1.5 text-white/30 hover:text-[#00ff88] transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => revokeToken(token.id)}
                  className="p-1.5 text-white/30 hover:text-[#f87171] transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Best Practices */}
      <div className="bg-[#090c0e] border border-white/10 p-4 relative">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00ff88]/30" />
        
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-1">SECURITY BEST PRACTICES</h4>
            <ul className="space-y-1 text-[7px] font-mono uppercase tracking-[0.08em]">
              <li className="flex items-start gap-1.5 text-white/50"><span className="text-[#00ff88]">•</span> NEVER SHARE YOUR API TOKENS OR COMMIT THEM TO VERSION CONTROL</li>
              <li className="flex items-start gap-1.5 text-white/50"><span className="text-[#00ff88]">•</span> USE DIFFERENT TOKENS FOR DIFFERENT APPLICATIONS AND ENVIRONMENTS</li>
              <li className="flex items-start gap-1.5 text-white/50"><span className="text-[#00ff88]">•</span> REGULARLY ROTATE TOKENS AND REVOKE UNUSED ONES</li>
              <li className="flex items-start gap-1.5 text-white/50"><span className="text-[#00ff88]">•</span> SET APPROPRIATE EXPIRATION DATES BASED ON USE CASE</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITokens;