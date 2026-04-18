const GlobalStyles = () => {
  return (
    <style>{`
      /* Tactical Animations */
      @keyframes blob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
      
      @keyframes ping {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      
      @keyframes glow {
        0% { box-shadow: 0 0 6px rgba(0, 255, 136, 0.2); }
        100% { box-shadow: 0 0 18px rgba(0, 255, 136, 0.45); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Animation Classes */
      .animate-blob {
        animation: blob 7s infinite;
      }
      
      .animate-ping {
        animation: ping 0.9s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      
      .animate-shimmer {
        animation: shimmer 1.6s linear infinite;
      }
      
      .animate-glow {
        animation: glow 2s ease-in-out infinite;
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s ease-out;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }
      
      /* Tactical Utility Classes */
      .corner-brackets {
        position: relative;
      }
      
      .corner-brackets::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 10px;
        height: 10px;
        border-top: 1px solid #00ff88;
        border-left: 1px solid #00ff88;
      }
      
      .corner-brackets::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-bottom: 1px solid #00ff88;
        border-right: 1px solid #00ff88;
      }
      
      /* Scanline Overlay */
      .scanline {
        position: relative;
        overflow: hidden;
      }
      
      .scanline::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          0deg,
          transparent 3px,
          rgba(0, 255, 136, 0.012) 3px,
          rgba(0, 255, 136, 0.012) 4px
        );
        z-index: 1;
      }
      
      /* Top Accent Line */
      .accent-line {
        position: relative;
      }
      
      .accent-line::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, #00ff88 40%, #22d3ee 60%, transparent);
      }
      
      /* Custom Scrollbar - Tactical */
      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 136, 0.3);
        border-radius: 0;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 255, 136, 0.5);
      }
      
      /* Selection Color */
      ::selection {
        background: rgba(0, 255, 136, 0.2);
        color: #00ff88;
      }
      
      /* Focus Ring - Tactical */
      *:focus {
        outline: none;
      }
      
      *:focus-visible {
        outline: 1px solid #00ff88;
        outline-offset: 2px;
      }
      
      /* Base Body Styles */
      body {
        font-family: 'JetBrains Mono', monospace;
        background-color: #080b0d;
        color: #ffffff;
      }
      
      /* Font Classes */
      .font-display {
        font-family: 'Syne', sans-serif;
      }
      
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
      
      /* Details/Summary for FAQ (legacy support) */
      details > summary {
        list-style: none;
        cursor: pointer;
      }
      
      details > summary::-webkit-details-marker {
        display: none;
      }
      
      details[open] summary {
        border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        margin-bottom: 0.5rem;
      }
    `}</style>
  );
};

export default GlobalStyles;