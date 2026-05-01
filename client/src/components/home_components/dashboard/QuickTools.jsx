const QuickTools = () => {
  const tools = [
    { 
      name: "WHOIS", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      name: "DNS", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ), 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      name: "SSL", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ), 
      color: "from-green-500 to-emerald-500" 
    },
    { 
      name: "Breach", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ), 
      color: "from-red-500 to-orange-500" 
    },
    { 
      name: "Metadata", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      color: "from-yellow-500 to-amber-500" 
    },
    { 
      name: "Social", 
      icon: (
        <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ), 
      color: "from-indigo-500 to-purple-500" 
    },
  ];

  return (
    <div className="glass-card p-4 lg:p-6 rounded-2xl lg:rounded-3xl">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 lg:gap-4">
        {tools.map((tool, i) => (
          <button
            key={i}
            className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#00E5FF]/5 border border-[#00E5FF]/10 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/10 transition-all transform hover:scale-105 flex flex-col items-center gap-2 group"
          >
            <span className="text-[#00E5FF] group-hover:text-white transition-colors">{tool.icon}</span>
            <span className="text-white text-xs lg:text-sm font-medium font-sans">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTools;
