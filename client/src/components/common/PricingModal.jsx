import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PricingModal = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { updateCredits } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure browser paints initial state before animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handlePurchase = async (plan) => {
    if (!plan.isPremium || isPurchasing) return;

    try {
      setIsPurchasing(true);
      const tokenCount = parseInt(plan.tokens.split(' ')[0]);
      
      const response = await api.post('/api/user/recharge', { tokens: tokenCount });
      
      if (response.data.success) {
        updateCredits(response.data.credits);
        // Show success message using the global toast system
        if (window.showToast) {
          window.showToast(`Success! Your account has been recharged with ${tokenCount} tokens.`, 'success');
        } else {
          alert(`Success! Your account has been recharged with ${tokenCount} tokens.`);
        }
        onClose();
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      if (window.showToast) {
        window.showToast('Purchase failed. Please try again.', 'error');
      } else {
        alert('Purchase failed. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const plans = [
    {
      name: 'Free operative',
      price: '$0',
      period: 'Forever',
      features: ['5 Intelligence Scans / day', 'Basic OSINT modules', 'Community Support', 'Single Project'],
      tokens: '5 Scans/Day',
      buttonText: 'Current Plan',
      isPremium: false,
    },
    {
      name: 'Advanced Investigator',
      price: '$5',
      period: 'Per 30 Scans',
      features: ['30 Full Analysis Credits', 'Priority Module Queue', 'Deep Email & Phone Forensics', 'Exportable Reports'],
      tokens: '30 Scan Tokens',
      buttonText: 'Recharge $5',
      isPremium: true,
      isBestValue: true
    },
    {
      name: 'Elite Cyber Scout',
      price: '$20',
      period: 'Per 100 Scans',
      features: ['100 Master Intelligence Credits', 'Global Threat Feed Access', 'Real-time Crypto Tracking', 'Dedicated API Access'],
      tokens: '100 Scan Tokens',
      buttonText: 'Recharge $20',
      isPremium: true,
    }
  ];

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-6xl max-h-[95vh] bg-[#050505] rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-[0_0_80px_-15px_rgba(0,229,255,0.2)] overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.9] translate-y-12'
        }`}
      >
        
        {/* Interior Glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative p-5 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
              Intelligence <span className="text-[#00E5FF]">Clearance</span>
            </h2>
            <p className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
              Unlock advanced OSINT capabilities and increase your operation range
            </p>
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all hover:rotate-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative group rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-300 flex flex-col ${
                  plan.isBestValue 
                    ? 'border-[#00E5FF]/40 bg-[#00E5FF]/[0.02] shadow-[0_20px_40px_-15px_rgba(0,229,255,0.1)]' 
                    : 'border-white/5 bg-white/[0.01] hover:border-white/15'
                }`}
              >
                {plan.isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)] z-10">
                    Tactical
                  </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="mb-6 sm:mb-8 text-center md:text-left">
                    <h3 className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-2 ${plan.isPremium ? 'text-yellow-500' : 'text-white/30'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center md:justify-start gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{plan.period}</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                      <svg className={`w-3.5 h-3.5 ${plan.isPremium ? 'text-yellow-500' : 'text-[#00E5FF]'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase">{plan.tokens}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-8 sm:mb-10">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3">
                        <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${plan.isPremium ? 'bg-yellow-500' : 'bg-[#00E5FF]'}`} />
                        <span className="text-[12px] sm:text-[13px] font-semibold text-white/60 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePurchase(plan)}
                    disabled={isPurchasing && plan.isPremium}
                    className={`w-full py-4 rounded-xl sm:rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 mt-auto ${
                    plan.isPremium 
                      ? 'bg-[#00E5FF] text-black shadow-[0_10px_20px_-5px_rgba(0,229,255,0.3)] hover:brightness-110' 
                      : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white cursor-default'
                  }`}>
                    {isPurchasing && plan.isPremium ? 'Processing...' : plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods Footer */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-20 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-700">
              {/* Crypto */}
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-widest">Crypto</span>
              </div>
              {/* Mastercard/Visa */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5 text-white">
                  <div className="w-4 h-4 rounded-full bg-red-500/80" />
                  <div className="w-4 h-4 rounded-full bg-yellow-500/80" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Cards</span>
              </div>
              {/* Stripe */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-black uppercase tracking-tighter italic">STRIPE</span>
              </div>
            </div>
            <p className="mt-8 text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] text-center">
              Secured Clearance Network • Encryption Active
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default PricingModal;