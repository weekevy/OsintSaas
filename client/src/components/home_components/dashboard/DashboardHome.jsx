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
  selectedProjectId // Add this prop
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      
      {/* Risk Assessment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <RiskCircle 
          riskScore={riskScore}
          getRiskColor={getRiskColor}
          getRiskBgColor={getRiskBgColor}
        />
        
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-4 lg:p-6">
            <h4 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Quick Analysis
            </h4>
            <div className="flex items-center justify-between">
              <p className="text-white/60">Start a new investigation or continue where you left off</p>
              <button 
                onClick={onAnalyzeClick}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                New Analysis
              </button>
            </div>
          </div>
          
          {/* Current Projects with selection */}
          <CurrentProjects 
            onSelectProject={onProjectSelect}
            selectedProjectId={selectedProjectId}
            limit={4}
          />
        </div>
      </div>

      {/* Alerts Section - Shows project-specific alerts */}
      <AlertsSection alerts={alerts} />

      {/* Recent Scans & Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <RecentScans scans={recentScans} />
        <ThreatFeed />
      </div>

      {/* Quick Tools */}
      <QuickTools />
    </div>
  );
};

export default DashboardHome;
