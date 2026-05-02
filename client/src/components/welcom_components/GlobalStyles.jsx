const GlobalStyles = () => {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

      :root {
        --accent: #00E5FF;
        --accent-secondary: #007AFF;
        --accent-glow: rgba(0, 229, 255, 0.4);
        --bg-black: #000000;
        --card-bg: rgba(10, 10, 10, 0.4);
        --border-color: rgba(255, 255, 255, 0.08);
      }

      .text-wave {
        background: linear-gradient(
          90deg, 
          #00E5FF 0%, 
          #007AFF 25%, 
          #00E5FF 50%, 
          #007AFF 75%, 
          #00E5FF 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .border-wave {
        position: relative;
      }
      
      .border-wave::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          90deg, 
          transparent 0%, 
          rgba(0, 229, 255, 0.5) 25%, 
          rgba(0, 122, 255, 0.8) 50%, 
          rgba(0, 229, 255, 0.5) 75%, 
          transparent 100%
        );
        background-size: 200% auto;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .bg-wave {
        background: linear-gradient(
          90deg, 
          #00E5FF 0%, 
          #007AFF 50%, 
          #00E5FF 100%
        );
        background-size: 200% auto;
      }

      /* Base Styles */
      body {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-black);
        color: #FFFFFF;
        overflow-x: hidden;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
      }

      section {
        content-visibility: auto;
        contain-intrinsic-size: 800px;
      }

      /* Disable content-visibility for critical sections */
      #home, #navbar, #footer {
        content-visibility: visible;
      }

      h1, h2, h3, h4 {
        font-family: 'Plus+Jakarta+Sans', 'Inter', sans-serif;
        letter-spacing: -0.02em;
      }

      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }

      /* Glassmorphism */
      .glass-card {
        background: var(--card-bg);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid var(--border-color);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        transform: translateZ(0);
      }

      .glass-nav {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transform: translateZ(0);
      }

      @media (max-width: 768px) {
        .glass-card, .glass-nav {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      }

      .border-beam-container {
        position: relative;
        border-radius: inherit;
      }

      .border-beam {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(to right, transparent, var(--accent), transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .group:hover .border-beam {
        opacity: 1;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--bg-black);
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--accent);
      }

      /* Selection Color */
      ::selection {
        background: var(--accent-glow);
        color: #FFFFFF;
      }

      /* Text Gradient Utilities */
      .text-gradient-silver {
        background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .text-gradient-cyan {
        background: linear-gradient(90deg, #00E5FF 0%, #2DD4BF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}</style>
  );
};

export default GlobalStyles;