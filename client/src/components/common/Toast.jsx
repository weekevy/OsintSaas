import React, { useState, useEffect, useCallback } from 'react';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    window.showToast = addToast;
    return () => { delete window.showToast; };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[30000] flex flex-col gap-3 pointer-events-none max-w-[90vw] sm:max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ message, type, duration, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  const themes = {
    success: { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-[#2DD4BF]', border: 'border-[#2DD4BF]/20', bg: 'bg-[#0a0a0a]/90' },
    error: { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-[#f87171]', border: 'border-[#f87171]/20', bg: 'bg-[#0a0a0a]/90' },
    info: { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-[#00E5FF]', border: 'border-[#00E5FF]/20', bg: 'bg-[#0a0a0a]/90' }
  };

  const theme = themes[type] || themes.info;

  return (
    <div className={`pointer-events-auto flex items-start gap-4 p-4 rounded-xl border ${theme.border} ${theme.bg} backdrop-blur-xl shadow-2xl animate-slideUp font-['Poppins'] relative overflow-hidden`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border border-white/10 ${theme.color} flex-shrink-0`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={theme.icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-40">{type}</p>
        <p className="text-sm font-bold text-white/90 leading-tight">{message}</p>
      </div>
      <button onClick={onRemove} className="text-white/20 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Visual progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-current opacity-20" style={{
        width: '100%',
        backgroundColor: theme.color.replace('text-', ''),
        animation: `toast-progress ${duration}ms linear forwards`
      }} />
      
      <style jsx>{`
        @keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
};

export default ToastContainer;