import { useState } from 'react';

const APITokens = () => {
  const [tokens, setTokens] = useState([
    {
      id: 1,
      name: 'Production API Token',
      token: 'ow_live_2x7f9k3m1q5p8v4n2r6t9y1w3z5x7c9v',
      created: '2024-01-15',
      expires: '2025-01-15',
      lastUsed: '2 min ago',
      permissions: ['read', 'write', 'delete'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Development Token',
      token: 'ow_dev_3y8g6h2j4k7l1m9n5p8r2t6w9z4x7c1v',
      created: '2024-02-20',
      expires: '2025-02-20',
      lastUsed: '1 hour ago',
      permissions: ['read', 'write'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Analytics Integration',
      token: 'ow_analytics_4z9h7j3k6l2m8n4p1r5t9w2x6c8v3b',
      created: '2024-03-01',
      expires: '2024-06-01',
      lastUsed: '3 days ago',
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
      name: newTokenName,
      token: `ow_${Math.random().toString(36).substr(2, 32)}`,
      created: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + parseInt(newTokenExpiry) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastUsed: 'Never',
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
      case 'active': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/30';
      case 'expiring': return 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30';
      case 'expired': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h3 className="text-white font-sans text-base font-bold">API Tokens</h3>
          <p className="text-white/30 text-xs mt-0.5">Manage authentication tokens for API access</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 border border-[#00E5FF]/30 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors duration-150 text-xs font-sans font-semibold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate Token
        </button>
      </div>

      {/* Create Token Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-white/10 bg-black p-5">
          <h4 className="text-white font-sans text-sm font-bold mb-4">Generate New API Token</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-xs mb-1">Token Name</label>
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
                placeholder="e.g., Production, Development"
              />
            </div>

            <div>
              <label className="block text-white/40 text-xs mb-1">Expiration</label>
              <select
                value={newTokenExpiry}
                onChange={(e) => setNewTokenExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
                <option value="0">Never Expires</option>
              </select>
            </div>

            <div>
              <label className="block text-white/40 text-xs mb-2">Permissions</label>
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
                      className="w-4 h-4 border border-white/20 bg-transparent text-[#00E5FF] rounded focus:ring-0"
                    />
                    <span className="text-white/70 text-xs capitalize">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-xs font-sans"
              >
                Cancel
              </button>
              <button
                onClick={createToken}
                disabled={!newTokenName}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-xs font-sans disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-3">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-150 p-4"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-sans font-semibold text-sm">{token.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold border ${getStatusColor(token.status)}`}>
                    {token.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <code className="bg-black/30 px-2 py-1 rounded text-white/60 text-[10px] font-mono">
                      {token.token.substring(0, 20)}...{token.token.substring(token.token.length - 10)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(token.token)}
                      className="p-1 text-white/40 hover:text-[#00E5FF] transition-colors duration-150"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-white/40">Created: <span className="text-white/60">{token.created}</span></span>
                    <span className="text-white/40">Expires: <span className={`${token.status === 'expiring' ? 'text-[#fbbf24]' : 'text-white/60'}`}>{token.expires}</span></span>
                    <span className="text-white/40">Last Used: <span className="text-white/60">{token.lastUsed}</span></span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Permissions:</span>
                      {token.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded border border-[#00E5FF]/30 text-[#00E5FF] text-[9px] font-sans font-semibold">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-white/40 hover:text-[#00E5FF] transition-colors duration-150 rounded-lg hover:bg-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => revokeToken(token.id)}
                  className="p-2 text-white/40 hover:text-red-500 transition-colors duration-150 rounded-lg hover:bg-red-500/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Best Practices */}
      <div className="rounded-xl border border-white/10 bg-black p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-sans text-xs font-bold mb-1">Security Best Practices</h4>
            <ul className="space-y-1 text-[11px] text-white/50">
              <li className="flex items-start gap-1.5"><span className="text-[#00E5FF]">•</span> Never share your API tokens or commit them to version control</li>
              <li className="flex items-start gap-1.5"><span className="text-[#00E5FF]">•</span> Use different tokens for different applications and environments</li>
              <li className="flex items-start gap-1.5"><span className="text-[#00E5FF]">•</span> Regularly rotate tokens and revoke unused ones</li>
              <li className="flex items-start gap-1.5"><span className="text-[#00E5FF]">•</span> Set appropriate expiration dates based on use case</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITokens;