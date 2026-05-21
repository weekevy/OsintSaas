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
            className={`p-5 rounded-xl border-2 transition-colors duration-150 text-left
              ${plan === planType
                ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                : 'border-white/10 hover:border-white/20 bg-black'
              }`}
          >
            {plan === planType && (
              <div className="inline-block mb-2 px-2 py-0.5 rounded bg-[#00E5FF] text-black text-[9px] font-bold uppercase">
                Current
              </div>
            )}
            <h3 className="text-xl font-bold text-white capitalize mb-2">{planType}</h3>
            <div className="text-2xl font-bold text-[#00E5FF] mb-4">{limits[planType].cost}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Requests</span>
                <span className="text-white font-mono">{limits[planType].requests}/{limits[planType].period}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Concurrent</span>
                <span className="text-white font-mono">{limits[planType].concurrent}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Burst</span>
                <span className="text-white font-mono">{limits[planType].burst}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Current Usage */}
      <div className="rounded-xl border border-white/10 bg-black p-6">
        <h3 className="text-white font-sans text-base font-bold mb-6">Current Usage</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">API Calls (This Hour)</span>
              <span className="text-[#00E5FF] font-bold">3,421 / 10,000</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[34%] bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] rounded-full" />
            </div>
            <p className="text-white/30 text-[10px] mt-2">Resets in 23 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-white/40 text-[10px] mb-1">Concurrent Requests</div>
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-white/30 text-[9px]">of 20 allowed</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-white/40 text-[10px] mb-1">Burst Usage</div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-white/30 text-[9px]">of 50 allowed</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-white/40 text-[10px] mb-1">Error Rate</div>
              <div className="text-2xl font-bold text-[#00E5FF]">0.23%</div>
              <div className="text-white/30 text-[9px]">Below threshold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limit Headers */}
      <div className="rounded-xl border border-white/10 bg-black p-6">
        <h3 className="text-white font-sans text-base font-bold mb-4">Rate Limit Headers</h3>
        
        <div className="rounded-lg border border-white/10 bg-black/30 p-4 mb-6">
          <pre className="text-white/60 text-xs font-mono overflow-x-auto">
{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 6579
X-RateLimit-Reset: 1702950000
Retry-After: 45`}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { header: 'X-RateLimit-Limit', description: 'Max requests allowed in the current period' },
            { header: 'X-RateLimit-Remaining', description: 'Number of requests remaining in the current period' },
            { header: 'X-RateLimit-Reset', description: 'Unix timestamp when the rate limit resets' },
            { header: 'Retry-After', description: 'Seconds to wait before retrying (when rate limited)' }
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <code className="text-[#00E5FF] text-xs font-mono block mb-1">{item.header}</code>
              <span className="text-white/40 text-[10px]">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Prompt */}
      {plan === 'free' && (
        <div className="rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-sans text-sm font-bold mb-1">Need higher limits?</h4>
              <p className="text-white/40 text-xs">Upgrade to Pro for 10x more requests and priority support</p>
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-xs">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimits;