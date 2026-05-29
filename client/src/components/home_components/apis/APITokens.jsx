import { useState, useEffect } from 'react';
import api from '../../../services/api';

const APITokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState('30');
  const [newTokenPermissions, setNewTokenPermissions] = useState(['read']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await api.get('/api/user/api-tokens');
      if (response.data.success) {
        setTokens(response.data.tokens);
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    setCreating(true);
    try {
      const response = await api.post('/api/user/api-tokens', {
        name: newTokenName,
        expires_days: parseInt(newTokenExpiry),
        permissions: newTokenPermissions
      });
      if (response.data.success) {
        setTokens([response.data.token, ...tokens]);
        setShowCreateForm(false);
        setNewTokenName('');
      }
    } catch (err) {
      console.error('Failed to create token:', err);
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (id) => {
    if (!confirm('Are you sure you want to revoke this token? It will no longer be usable.')) return;
    
    try {
      await api.delete(`/api/user/api-tokens/${id}`);
      setTokens(tokens.map(t => t.id === id ? { ...t, status: 'revoked' } : t));
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/30';
      case 'revoked': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'expired': return 'text-white/20 bg-white/5 border-white/10';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  if (loading) return (
    <div className="py-20 text-center opacity-40">
      <div className="w-10 h-10 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mx-auto mb-4" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Tokens...</span>
    </div>
  );

  return (
    <div className="space-y-5 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h3 className="text-white font-sans text-base font-bold">API Tokens</h3>
          <p className="text-white/30 text-xs mt-0.5">Manage authentication tokens for programmatic access</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 border border-[#00E5FF]/30 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-all duration-150 text-xs font-sans font-semibold flex items-center gap-2 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate Token
        </button>
      </div>

      {/* Create Token Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <h4 className="text-white font-sans text-sm font-bold mb-4 uppercase tracking-wider">Generate New API Token</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Token Name</label>
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
                placeholder="e.g., CI/CD Pipeline, Python Script"
              />
            </div>

            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Expiration</label>
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
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Permissions</label>
              <div className="flex flex-wrap gap-3">
                {['read', 'write', 'delete'].map((permission) => (
                  <label key={permission} className="flex items-center gap-1.5 cursor-pointer group">
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
                      className="w-4 h-4 border border-white/20 bg-transparent text-[#00E5FF] rounded focus:ring-0 cursor-pointer"
                    />
                    <span className="text-white/40 text-[10px] font-bold uppercase group-hover:text-white/70 transition-colors">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-xs font-sans uppercase tracking-widest font-bold"
              >
                Cancel
              </button>
              <button
                onClick={createToken}
                disabled={!newTokenName || creating}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-xs font-sans uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Generate Node'}
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
            className={`rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 p-4 ${token.status === 'revoked' ? 'opacity-40 grayscale' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-sans font-bold text-sm uppercase tracking-tight">{token.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-black uppercase tracking-widest border ${getStatusColor(token.status)}`}>
                    {token.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 group">
                    <code className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[#00E5FF] text-[10px] font-mono tracking-wider break-all">
                      {token.token.substring(0, 15)}••••••••••••••••{token.token.substring(token.token.length - 8)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(token.token)}
                      className="p-2 text-white/20 hover:text-[#00E5FF] transition-all duration-150 hover:bg-[#00E5FF]/10 rounded-lg active:scale-90"
                      title="Copy full token"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-white/20">Created: <span className="text-white/60">{new Date(token.created_at).toLocaleDateString()}</span></span>
                    <span className="text-white/20">Expires: <span className="text-white/60">{token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Never'}</span></span>
                    <span className="text-white/20">Last Used: <span className="text-white/60">{token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}</span></span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/20">Permissions:</span>
                      <div className="flex gap-1">
                        {token.permissions.map((perm) => (
                          <span key={perm} className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[7px] font-black">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {token.status === 'active' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => revokeToken(token.id)}
                    className="px-3 py-1.5 text-red-500/40 hover:text-red-500 transition-all duration-150 rounded-lg hover:bg-red-500/10 text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-red-500/20"
                  >
                    Revoke Key
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {tokens.length === 0 && (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl opacity-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Active API Interfaces</p>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="rounded-xl border border-white/5 bg-black/40 p-4">
        <div className="flex items-start gap-3 opacity-60">
          <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center bg-white/5">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-sans text-[10px] font-bold mb-1 uppercase tracking-widest">Interface Protocol</h4>
            <p className="text-[9px] text-white/30 leading-relaxed">Ensure tokens are stored in environment variables. Authorization requires the <code className="text-[#00E5FF]">X-API-Key</code> header for all requests to the central orchestrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITokens;