import { useState } from 'react';
import RiskCircle from './RiskCircle';
import AlertsSection from './AlertsSection';
import RecentScans from './RecentScans';
import ThreatFeed from './ThreatFeed';
import QuickTools from './QuickTools';
import CurrentProjects from './CurrentProjects';
import { ScanProgressModal } from '../scan/core/ScansManager';

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
  selectedProjectStatus,     // NEW: status of selected project (running, paused, completed, etc.)
  selectedProjectFindings,   // NEW: findings count of selected project
  onRiskDataChange,
  refreshTrigger,
  onRefresh
}) => {
  const [selectedScanForDetail, setSelectedScanForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewScanDetail = (scan) => {
    setSelectedScanForDetail(scan);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="dashboard-ambient min-h-screen font-sans text-white">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10 pb-14 md:pb-12">

        {/* <header className="mb-8 md:mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E5FF]/85 uppercase mb-2">
            Intelligence overview
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[2rem] font-semibold tracking-tight text-white">
            Your operations hub
          </h1>
          <p className="mt-2 text-sm md:text-[15px] text-white/50 leading-relaxed">
            Live risk posture, investigations, and signals—organized like a modern control room.
          </p>
        </header> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10 items-start">
          <div className="lg:col-span-1 min-w-0" id="tour-risk-circle">
            <RiskCircle
              riskData={selectedRiskData}
              projectName={selectedProjectName}
              projectTarget={selectedProjectTarget}
              projectStatus={selectedProjectStatus}        // NEW: pass status
              projectFindings={selectedProjectFindings}    // NEW: pass findings
              getRiskColor={getRiskColor}
              getRiskBgColor={getRiskBgColor}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 min-w-0">
            <div id="tour-start-scan" className="glass-card rounded-2xl p-5 sm:p-6 border border-white/[0.08] relative overflow-hidden group transition-colors duration-300 hover:border-[#00E5FF]/25">
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#2DD4BF]/10 border border-[#00E5FF]/25 flex items-center justify-center shrink-0 shadow-[0_0_24px_-8px_rgba(0,229,255,0.5)]">
                    <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#00E5FF]/90 tracking-[0.18em] uppercase mb-1">
                      New run
                    </p>
                    <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                      Start an investigation
                    </h2>
                    <p className="text-xs sm:text-sm text-white/45 mt-1 max-w-md">
                      Open the scanner to run OSINT modules on a target.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onAnalyzeClick}
                  className="w-full sm:w-auto shrink-0 px-6 py-3.5 rounded-xl bg-white text-[#050608] text-xs font-semibold tracking-wide uppercase hover:bg-[#00E5FF] transition-colors duration-200 shadow-lg shadow-black/25"
                >
                  Open scanner
                </button>
              </div>
            </div>

            <CurrentProjects
              onSelectProject={onProjectSelect}
              onRiskDataChange={onRiskDataChange}
              onViewDetail={handleViewScanDetail}
              selectedProjectId={selectedProjectId}
              limit={4}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        <section className="mb-8 md:mb-10" id="tour-alerts">
          <AlertsSection alerts={alerts} selectedProjectId={selectedProjectId} onRefresh={onRefresh} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
          <div id="tour-recent-scans">
            <RecentScans scans={recentScans} selectedProjectId={selectedProjectId} />
          </div>
          <div id="tour-threat-feed">
            <ThreatFeed feeds={alerts} selectedProjectId={selectedProjectId} onRefresh={onRefresh} />
          </div>
        </section>

        <section id="tour-quick-tools">
          <QuickTools />
        </section>

        <ScanProgressModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          scan={selectedScanForDetail}
        />
      </div>
    </div>
  );
};

export default DashboardHome;