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
  onRiskDataChange
}) => {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      
      {/* Risk Assessment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <RiskCircle 
          riskData={selectedRiskData}
          projectName={selectedProjectName}
          projectTarget={selectedProjectTarget}
          getRiskColor={getRiskColor}
          getRiskBgColor={getRiskBgColor}
        />
        
        <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Quick Analysis Box */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-3xl border border-white/10 p-3 sm:p-4 md:p-5 lg:p-6">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Quick Analysis
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">
                Start a new investigation or continue where you left off
              </p>
              <button 
                onClick={onAnalyzeClick}
                className="w-full sm:w-auto px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
              >
                New Analysis
              </button>
            </div>
          </div>
          
          {/* Current Projects with selection and risk data callback */}
          <CurrentProjects 
            onSelectProject={onProjectSelect}
            onRiskDataChange={onRiskDataChange}
            selectedProjectId={selectedProjectId}
            limit={4}
          />
        </div>
      </div>

      {/* Alerts Section */}
      <AlertsSection 
        alerts={alerts}
        selectedProjectId={selectedProjectId}
      />

      {/* Recent Scans & Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <RecentScans 
          scans={recentScans}
          selectedProjectId={selectedProjectId}
        />
        <ThreatFeed 
          feeds={[]}
          selectedProjectId={selectedProjectId}
        />
      </div>

      {/* Quick Tools */}
      <QuickTools />
    </div>
  );
};

export default DashboardHome;