import { useState } from 'react';

const RateLimits = () => {
  const [plan, setPlan] = useState('pro');

  const limits = {
    free: {
      requests: '1,000',
      period: 'hour',
      concurrent: 5,
      burst: 10,
      cost: '$0'
    },
    pro: {
      requests: '10,000',
      period: 'hour',
      concurrent: 20,
      burst: 50,
      cost: '$49/mo'
    },
    enterprise: {
      requests: 'Custom',
      period: 'hour',
      concurrent: 'Unlimited',
      burst: 'Custom',
      cost: 'Custom'
    }
  };

  const currentLimits = limits[plan];

  return (
    <div className="space-y-6 font-sans">
      {/* Plan Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['free', 'pro', 'enterprise'].map((planType) => (
          <button
            key={planType}
            onClick={() => setPlan(planType)}
            className={`p-6 glass-card border-2 transition-all text-left relative overflow-hidden
              ${plan === planType
                ? 'border-[#00E5FF] bg-[#00E5FF]/5'
                : 'border-white/10 hover:border-white/20'
              }`}
          >
            {plan === planType && (
              <div className="absolute top-0 right-0 p-1">
                <div className="bg-[#00E5FF] text-black text-[6px] font-bold px-1.5 py-0.5 uppercase tracking-tighter">CURRENT</div>
              </div>
            )}
            <h3 className="text-xl font-bold text-white capitalize mb-2 tracking-tight">{planType}</h3>
            <div className="text-2xl font-black text-[#00E5FF] mb-4">{limits[planType].cost}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-white/40">Requests</span>
                <span className="text-white font-mono">{limits[planType].requests}/{limits[planType].period}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-white/40">Concurrent</span>
                <span className="text-white font-mono">{limits[planType].concurrent}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-white/40">Burst</span>
                <span className="text-white font-mono">{limits[planType].burst}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Current Usage */}
      <div className="glass-card border border-white/10 p-6 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">CURRENT USAGE</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
              <span className="text-white/40">API CALLS (THIS HOUR)</span>
              <span className="text-[#00E5FF] font-bold">3,421 / 10,000</span>
            </div>
            <div className="h-1.5 bg-white/5 border border-white/10 overflow-hidden">
              <div className="h-full w-[34%] bg-[#00E5FF]" />
            </div>
            <p className="text-white/20 text-[8px] uppercase tracking-widest mt-2">RESETS IN 23 MINUTES</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 glass-card border border-white/10">
              <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">CONCURRENT REQUESTS</div>
              <div className="text-2xl font-bold text-white font-mono">3</div>
              <div className="text-white/20 text-[8px] uppercase tracking-widest">OF 20 ALLOWED</div>
            </div>
            <div className="p-4 glass-card border border-white/10">
              <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">BURST USAGE</div>
              <div className="text-2xl font-bold text-white font-mono">12</div>
              <div className="text-white/20 text-[8px] uppercase tracking-widest">OF 50 ALLOWED</div>
            </div>
            <div className="p-4 glass-card border border-white/10">
              <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">ERROR RATE</div>
              <div className="text-2xl font-bold text-[#00E5FF] font-mono">0.23%</div>
              <div className="text-white/20 text-[8px] uppercase tracking-widest">BELOW THRESHOLD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limit Headers */}
      <div className="glass-card border border-white/10 p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">RATE LIMIT HEADERS</h3>
        
        <div className="glass-card border border-white/10 p-4 mb-6">
          <pre className="text-white/60 text-[9px] font-mono overflow-x-auto">
{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 6579
X-RateLimit-Reset: 1702950000
Retry-After: 45`}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { header: 'X-RateLimit-Limit', description: 'MAX REQUESTS ALLOWED IN THE CURRENT PERIOD' },
            { header: 'X-RateLimit-Remaining', description: 'NUMBER OF REQUESTS REMAINING IN THE CURRENT PERIOD' },
            { header: 'X-RateLimit-Reset', description: 'UNIX TIMESTAMP WHEN THE RATE LIMIT RESETS' },
            { header: 'Retry-After', description: 'SECONDS TO WAIT BEFORE RETRYING (WHEN RATE LIMITED)' }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-white/5 bg-white/[0.02]">
              <code className="text-[#00E5FF] text-[9px] font-mono whitespace-nowrap">{item.header}</code>
              <span className="text-white/40 text-[8px] uppercase tracking-widest leading-tight">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Prompt */}
      {plan === 'free' && (
        <div className="glass-card border border-[#00E5FF]/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest mb-1">NEED HIGHER LIMITS?</h4>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">UPGRADE TO PRO FOR 10X MORE REQUESTS AND PRIORITY SUPPORT</p>
            </div>
            <button className="px-6 py-3 bg-[#00E5FF] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
              UPGRADE NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimits;
