const QuickTools = () => {
  const tools = [
    {
      name: 'WHOIS',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'DNS',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      name: 'SSL',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      name: 'Breach',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      name: 'Metadata',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Social',
      icon: (
        <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-black rounded-2xl p-5 lg:p-6 border border-white/[0.07]">
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Toolkit</p>
        <h3 className="text-base lg:text-lg font-semibold text-white mt-1 tracking-tight">
          Quick utilities
        </h3>
        <p className="text-xs text-white/45 mt-1 max-w-lg">
          Shortcuts for common checks—styled like a calm product surface, not a control panel.
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 lg:gap-4">
        {tools.map((tool, i) => (
          <button
            key={i}
            type="button"
            className="group p-3 lg:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/6 transition-colors duration-150 flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40"
          >
            <span className="text-[#00E5FF] group-hover:text-white transition-colors p-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/15 group-hover:border-white/20">
              {tool.icon}
            </span>
            <span className="text-white/80 text-xs font-medium text-center">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTools;
