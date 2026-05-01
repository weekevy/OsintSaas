import RiskCircle from './RiskCircle';
import AlertsSection from './AlertsSection';
import RecentScans from './RecentScans';
import ThreatFeed from './ThreatFeed';
import QuickTools from './QuickTools';
import CurrentProjects from './CurrentProjects';

const DashboardHome = ({
  riskScore,
  getRiskColor,
  getRiskBgColor,
  recentScans,
  alerts,
  timeRange,
  onTimeRangeChange,
  onAnalyzeClick,
  onProjectSelect,
  selectedProjectId,
  selectedRiskData,
  selectedProjectName,
  selectedProjectTarget,
  onRiskDataChange,
  refreshTrigger
}) => {
  return (
    <div className="p-6 md:p-8 bg-black min-h-screen font-sans">
      {/* ── Main 3-col grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
        {/* Risk Circle — fixed width column */}
        <div className="lg:col-span-1 min-w-0">
          <RiskCircle
            riskData={selectedRiskData}
            projectName={selectedProjectName}
            projectTarget={selectedProjectTarget}
            getRiskColor={getRiskColor}
            getRiskBgColor={getRiskBgColor}
          />
        </div>

        {/* Right column: Quick analysis + Current Projects */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">

          {/* Quick Analysis card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 border-white/[0.08] hover:border-[#00E5FF]/30">
            {/* Border Beam - static since no animation */}
            <div className="border-beam" style={{ opacity: 0.5 }} />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#00E5FF] tracking-[0.15em] uppercase mb-1">
                    Intelligence Engine
                  </div>
                  <div className="text-xl font-black text-white tracking-tight uppercase">
                    New Investigation
                  </div>
                </div>
              </div>

              <button
                onClick={onAnalyzeClick}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black text-xs tracking-[0.1em] rounded-xl hover:bg-[#00E5FF] hover:text-black transition-all duration-300 uppercase shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                Launch Scanner
              </button>
            </div>
          </div>

          {/* Current Projects */}
          <CurrentProjects
            onSelectProject={onProjectSelect}
            onRiskDataChange={onRiskDataChange}
            selectedProjectId={selectedProjectId}
            limit={4}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────── */}
      <div className="mb-6">
        <AlertsSection alerts={alerts} selectedProjectId={selectedProjectId} />
      </div>

      {/* ── Bottom grid: Recent Scans + Threat Feed ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentScans scans={recentScans} selectedProjectId={selectedProjectId} />
        <ThreatFeed feeds={[]} selectedProjectId={selectedProjectId} />
      </div>

      {/* ── Quick Tools ──────────────────────────────────────── */}
      <QuickTools />
    </div>
  );
};

export default DashboardHome;