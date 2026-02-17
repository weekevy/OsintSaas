import { forwardRef } from 'react';

const HomeSection = forwardRef(({ hasAnimated, onRegisterClick, onServicesClick }, ref) => {
  // Professional SVG icons
  const getFeatureIcon = (type) => {
    switch(type) {
      case 'research':
        return (
          <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" stroke="url(#gradient-research)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-research" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7"/>
                <stop offset="1" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'realtime':
        return (
          <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6v6l4 2m-4-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="url(#gradient-realtime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 12 12)"/>
            <defs>
              <linearGradient id="gradient-realtime" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'secure':
        return (
          <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" stroke="url(#gradient-secure)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-secure" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EC4899"/>
                <stop offset="1" stopColor="#A855F7"/>
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      ref={ref} 
      id="home" 
      className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 mt-5
                          transition-all duration-700 delay-100
                          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-sm text-white/80">Professional OSINT Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className={`font-rubik text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 max-w-5xl
                          transition-all duration-700 delay-200
                          ${hasAnimated ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
            <span className="block mb-3">Uncover the Truth</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
              Break Down Scammers
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-white/60 text-lg sm:text-xl md:text-2xl max-w-3xl mb-12 leading-relaxed
                        transition-all duration-700 delay-300
                        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Professional OSINT tools to investigate, verify, and protect yourself from online fraud
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-wrap gap-4 justify-center mb-16
                          transition-all duration-700 delay-400
                          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button
              onClick={onRegisterClick}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 text-white font-semibold
                       hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105
                       before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Investigation
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button
              onClick={onServicesClick}
              className="group px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold
                       hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                View Services
                <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>

          {/* Feature Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl
                          transition-all duration-700 delay-500
                          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {[
              { icon: 'research', title: 'Deep Research', desc: 'Advanced investigation tools' },
              { icon: 'realtime', title: 'Real-time Data', desc: 'Live information gathering' },
              { icon: 'secure', title: 'Secure & Private', desc: 'Your data stays protected' }
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                                    hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500
                                    hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105">
                <div className="text-purple-400 group-hover:scale-110 transition-transform duration-500">
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add gradient animation keyframes */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;
