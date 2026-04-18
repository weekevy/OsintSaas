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
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).toUpperCase();

  // Derive a threat level from riskScore for the header badge
  const headerThreat = riskScore >= 75 ? { label: 'CRITICAL', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' }
    : riskScore >= 50 ? { label: 'HIGH ALERT', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' }
    : riskScore >= 25 ? { label: 'MONITORING', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' }
    : { label: 'NOMINAL', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' };

  return (
    <div style={{
      padding: '20px 24px 32px',
      background: '#080b0e',
      minHeight: '100vh',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    }}>

     

      {/* ── Main 3-col grid ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 16,
        marginBottom: 16,
        alignItems: 'start',
      }}>
        {/* Risk Circle — fixed width column */}
        <div style={{ minWidth: 0 }}>
          <RiskCircle
            riskData={selectedRiskData}
            projectName={selectedProjectName}
            projectTarget={selectedProjectTarget}
            getRiskColor={getRiskColor}
            getRiskBgColor={getRiskBgColor}
          />
        </div>

        {/* Right column: Quick analysis + Current Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

          {/* Quick Analysis card */}
          <div style={{
            background: 'linear-gradient(135deg, #0d1217 0%, #0a0e12 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
            position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            {/* Corner accents */}
            {[
              { top: 6, left: 6, borderTop: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' },
              { top: 6, right: 6, borderTop: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' },
              { bottom: 6, left: 6, borderBottom: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' },
              { bottom: 6, right: 6, borderBottom: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 10, height: 10, pointerEvents: 'none', ...s }} />
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 9,
                  background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg style={{ width: 18, height: 18, color: '#00ff88' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    QUICK ANALYSIS
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: 2, textTransform: 'uppercase' }}>
                    START NEW INVESTIGATION
                  </div>
                </div>
              </div>

              <button
                onClick={onAnalyzeClick}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid rgba(0,255,136,0.3)',
                  borderRadius: 7,
                  color: '#00ff88',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                  cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
                  transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.18)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; }}
              >
                <svg style={{ width: 11, height: 11 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill="currentColor"/>
                </svg>
                INITIATE SCAN
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
      <div style={{ marginBottom: 16 }}>
        <AlertsSection alerts={alerts} selectedProjectId={selectedProjectId} />
      </div>

      {/* ── Bottom grid: Recent Scans + Threat Feed ─────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, marginBottom: 16,
      }}>
        <RecentScans scans={recentScans} selectedProjectId={selectedProjectId} />
        <ThreatFeed feeds={[]} selectedProjectId={selectedProjectId} />
      </div>

      {/* ── Quick Tools ──────────────────────────────────────── */}
      <QuickTools />

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @media (max-width: 900px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
          .dash-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;

