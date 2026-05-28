import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  TopBar,
  DashboardHome,
  ScanDashboard,
  ProjectsDashboard,
  ReportsDashboard,
  TeamDashboard,
  IntegrationsDashboard,
  APIsDashboard,
  AnalyticsDashboard
} from "./home_components";
import { AccountSettings } from "./home_components/settings";
import ProductTour from "./common/ProductTour";
import PricingModal from "./common/PricingModal";

// ── Read a localStorage key safely at module level (before any render) ──
const ls = (key, fallback = null) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch { return fallback; }
};
const lsJson = (key, fallback = null) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const validTabs = ['dashboard', 'scan', 'projects', 'reports', 'team', 'apis', 'analytics', 'integrations'];
    return tab && validTabs.includes(tab) ? tab : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(() => ls('searchInput', ''));
  const [searchType, setSearchType] = useState(() => ls('searchType', 'url'));
  const [recentScans, setRecentScans] = useState([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRange, setTimeRange] = useState(() => ls('timeRange', 'week'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [currentTourSection, setCurrentTourSection] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const { user, markTourAsSeen } = useAuth();

  // ── Tour Definitions ──
  const tours = {
    dashboard: [
      { target: '#tour-nav', title: 'Primary Navigation', content: 'Quickly toggle between core operational modes: the real-time Dashboard, the modular Scanner, in-depth intelligence Reports, and Team collaboration protocols.', position: 'top' },
      { target: '#tour-credits', title: 'Resource Allocation', content: 'Investigations utilize computational resources. Monitor your current token balance here. High-priority scans may require additional clearance or replenishment.', position: 'bottom' },
      { target: '#tour-notifications', title: 'Intelligence Feed', content: 'Stay updated with critical alerts, scan completions, and operational requests from your team. Check here regularly for decoded notifications.', position: 'bottom' },
      { target: '#tour-start-scan', title: 'Launch Investigation', content: 'The starting point for every mission. Open the scanner to input targets (URLs, Emails, Phones) and select which intelligence modules to deploy.', position: 'bottom' },
      { target: '#tour-project-list', title: 'Mission History', content: 'Your tactical repository of all active and historical investigations. Click any mission to synchronize the workspace and analyze its findings.', position: 'left' },
      { target: '#tour-risk-circle', title: 'Risk Posture Hub', content: 'Mission-critical analysis at a glance. The Risk Circle visualizes the security posture of the selected target, highlighting critical vulnerabilities and analysis progress.', position: 'right' },
      { target: '#tour-alerts', title: 'Threat Alerts', content: 'A prioritized list of security signals and anomalies detected during active scans. Each alert provides direct links to the underlying threat data.', position: 'bottom' },
      { target: '#tour-recent-scans', title: 'Temporal Timeline', content: 'A chronological log of your recent activities. Use this for rapid context switching between your most frequent investigations.', position: 'bottom' }
    ],
    scan: [
      { target: '#tour-scan-header', title: 'Scan Terminal', content: 'This is your primary operations center for launching and monitoring OSINT modules.', position: 'bottom' },
      { target: '#tour-refresh-terminal', title: 'Terminal Sync', content: 'Synchronize your scan pipeline with the central processing unit to see real-time updates.', position: 'bottom' },
      { target: '#tour-running-scans', title: 'Active Stream', content: 'Live investigations currently executing in the cloud. Monitor progress, edit assets, or terminate processes here.', position: 'bottom' },
      { target: '#tour-initiate-module', title: 'Module Selection', content: 'Deploy specific intelligence gathering modules. Each tool is specialized for different target types like LinkedIn, Crypto, or Job Scams.', position: 'top' },
      { target: '#tour-scan-archives', title: 'Archive Retrieval', content: 'Access completed scan results and historical intelligence data for deep-dive analysis.', position: 'top' }
    ],
    reports: [
      { target: '#tour-reports-header', title: 'Intelligence Archives', content: 'Your repository for high-fidelity dossiers and consolidated investigation briefings.', position: 'bottom' },
      { target: '#tour-assemble-dossier', title: 'Assemble Dossier', content: 'Synthesize findings from your scans into a professional intelligence report with automated summaries.', position: 'bottom' },
      { target: '#tour-report-stats', title: 'Operational Metrics', content: 'Monitor your investigation output and intelligence sharing statistics across your entire organization.', position: 'bottom' },
      { target: '#tour-recent-reports', title: 'Recent Briefings', content: 'Quickly access your most recently generated intelligence dossiers for review or distribution.', position: 'top' }
    ],
    team: [
      { target: '#tour-team-header', title: 'Collaboration Hub', content: 'Coordinate with elite investigation squads. Share intelligence and manage collective missions from this interface.', position: 'bottom' },
      { target: '#tour-new-command', title: 'New Command', content: 'Initialize a new investigation squad. Invite members and set clearance levels for shared projects.', position: 'bottom' },
      { target: '#tour-team-cards', title: 'Active Squads', content: 'Your current network of operational teams. Each squad can have its own dedicated workspace and shared findings.', position: 'top' }
    ]
  };

  useEffect(() => {
    if (user) {
      const hasSeenTour = user.hasSeenTours?.[activeTab];
      
      if (!hasSeenTour && tours[activeTab]) {
        // Small delay to ensure component is fully rendered
        const timer = setTimeout(() => {
          setTourSteps(tours[activeTab]);
          setCurrentTourSection(activeTab);
          setIsTourOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, activeTab]);

  const completeTour = () => {
    if (user && currentTourSection) {
      setIsTourOpen(false);
      markTourAsSeen(currentTourSection);
    }
  };

  // ── All project-related state initialised directly from localStorage ──
  // This is the key fix: no useEffect delay means RiskCircle gets the correct
  // values on the very first render, eliminating the idle flicker on refresh.
  const [selectedProject, setSelectedProject] = useState(() => {
    const p = lsJson('selectedProject', null);
    return p && p.id ? p : null;
  });
  const [projectAlerts, setProjectAlerts] = useState([]);
  const [selectedRiskData, setSelectedRiskData] = useState(() => lsJson('selectedRiskData', null));
  const [selectedProjectName, setSelectedProjectName] = useState(() => ls('selectedProjectName', ''));
  const [selectedProjectTarget, setSelectedProjectTarget] = useState(() => ls('selectedProjectTarget', ''));
  const [selectedProjectStatus, setSelectedProjectStatus] = useState(() => ls('selectedProjectStatus', 'idle'));
  const [selectedProjectFindings, setSelectedProjectFindings] = useState(() => {
    const v = ls('selectedProjectFindings', '0');
    return parseInt(v) || 0;
  });
  const [selectedModuleId, setSelectedModuleId] = useState(() => ls('currentModules_selectedId', null));
  
  const [projectRiskScore, setProjectRiskScore] = useState(() => {
    const riskData = lsJson('selectedRiskData', null);
    if (riskData && riskData.score !== undefined) return riskData.score;
    const project = lsJson('selectedProject', null);
    return project?.risk_score || 0;
  });

  useEffect(() => {
    if (selectedRiskData?.score !== undefined) {
      setProjectRiskScore(selectedRiskData.score);
    } else if (selectedProject) {
      setProjectRiskScore(selectedProject.risk_score || 0);
    } else {
      setProjectRiskScore(0);
    }
  }, [selectedRiskData, selectedProject]);

  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const { socket, isConnected, joinProject } = useSocket();

  const fetchDashboardData = useCallback(async () => {
    setIsDashboardLoading(true);
    // ── Fetch Alerts ──
    try {
      let url = '/api/dashboard/alerts';
      if (selectedProject?.id) {
        url += `?projectId=${selectedProject.id}`;
      }
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        const fetchedAlerts = data.alerts || [];
        setProjectAlerts(fetchedAlerts);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setProjectAlerts([]);
    }

    // ── Fetch Scans ──
    try {
      let url = '/api/dashboard/scans';
      if (selectedProject?.id) {
        url += `?projectId=${selectedProject.id}`;
      }
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setRecentScans(data.scans || []);
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [selectedProject?.id]);

  // ── Fetch Alerts and Scans whenever project or trigger changes ──
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, dashboardRefreshTrigger]);

  // WebSocket for real-time dashboard updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the project room on the server for targeted updates
    if (selectedProject?.id) {
      joinProject(selectedProject.id);
    }

    const handleUpdate = (data) => {
      console.log('WS: Dashboard Update', data);
      
      // Strategic Update: Strict project filtering and status-based suppression
      // 1. If a project is selected, only handle if data matches THAT project.
      // 2. If NO project is selected, handle everything to show global status.
      const isCurrentProject = !selectedProject?.id || (data?.projectId && String(data.projectId) === String(selectedProject.id));

      if (isCurrentProject) {
        // Strategic Enhancement: Only show alerts/popups if the project is 'completed'.
        // This prevents distractions during 'paused' or 'running' states.
        const canShowAlerts = !selectedProject?.id || selectedProjectStatus === 'completed';

        if (canShowAlerts && (data.type === 'threat' || data.type === 'warning' || data.type === 'success')) {
          const newAlert = {
            id: `ws_alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: data.title,
            message: data.message,
            type: data.type,
            created_at: data.created_at || new Date().toISOString(),
            scan_id: data.scan_id
          };

          setProjectAlerts(prev => {
            // Avoid duplicates
            if (prev.some(a => a.scan_id === data.scan_id && a.title === data.title)) return prev;
            return [newAlert, ...prev];
          });
        }

        // Small delay to let DB finish then re-sync for full data integrity
        setTimeout(() => fetchDashboardData(), 500);
      }
    };

    socket.on('new_notification', handleUpdate);
    socket.on('scan_completed', handleUpdate);

    return () => {
      socket.off('new_notification', handleUpdate);
      socket.off('scan_completed', handleUpdate);
    };
  }, [socket, isConnected, fetchDashboardData, selectedProject, joinProject]);

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    document.body.style.fontFamily = "'Inter', sans-serif";
    return () => { };
  }, []);

  const resetRiskData = () => {
    setSelectedRiskData(null);
    setSelectedProjectName('');
    setSelectedProjectTarget('');
    setSelectedProjectStatus('idle');
    setSelectedProjectFindings(0);
    setSelectedModuleId(null);
    // ── FIX: clear the RiskCircle persisted score so a stale score never
    // pre-fills the ring on refresh when no project is selected ──
    try { localStorage.removeItem('riskCircle_lastState'); } catch { /* ignore */ }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    const handlePopState = () => { setActiveTab(getTabFromUrl()); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

  useEffect(() => {
    if (activeTab === 'dashboard') setDashboardRefreshTrigger(prev => prev + 1);
  }, [activeTab]);

  useEffect(() => {
    const autoSelectProject = async () => {
      const savedSelectedProject = localStorage.getItem('selectedProject');
      if (savedSelectedProject) return;

      try {
        const response = await fetch('/api/projects', { credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.projects?.length > 0) {
          const firstProject = data.projects[0];
          handleProjectSelect(firstProject);
        }
      } catch (error) {
        console.error('Auto-select failed:', error);
      }
    };
    autoSelectProject();
  }, []);

  // ── Persist to localStorage whenever values change ──
  useEffect(() => { localStorage.setItem('searchInput', searchInput); }, [searchInput]);
  useEffect(() => { localStorage.setItem('searchType', searchType); }, [searchType]);
  useEffect(() => { localStorage.setItem('timeRange', timeRange); }, [timeRange]);
  useEffect(() => {
    if (selectedProject) localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    else localStorage.removeItem('selectedProject');
  }, [selectedProject]);
  useEffect(() => {
    if (selectedRiskData) localStorage.setItem('selectedRiskData', JSON.stringify(selectedRiskData));
    else localStorage.removeItem('selectedRiskData');
  }, [selectedRiskData]);
  useEffect(() => {
    if (selectedProjectName) localStorage.setItem('selectedProjectName', selectedProjectName);
    else localStorage.removeItem('selectedProjectName');
  }, [selectedProjectName]);
  useEffect(() => {
    if (selectedProjectTarget) localStorage.setItem('selectedProjectTarget', selectedProjectTarget);
    else localStorage.removeItem('selectedProjectTarget');
  }, [selectedProjectTarget]);
  useEffect(() => {
    if (selectedProjectStatus) localStorage.setItem('selectedProjectStatus', selectedProjectStatus);
    else localStorage.removeItem('selectedProjectStatus');
  }, [selectedProjectStatus]);
  useEffect(() => {
    if (selectedProjectFindings) localStorage.setItem('selectedProjectFindings', selectedProjectFindings.toString());
    else localStorage.removeItem('selectedProjectFindings');
  }, [selectedProjectFindings]);

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener('openSettings', handleOpenSettings);
    return () => window.removeEventListener('openSettings', handleOpenSettings);
  }, []);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear project-specific state to prevent leakage between accounts
    localStorage.removeItem('selectedProject');
    localStorage.removeItem('selectedRiskData');
    localStorage.removeItem('selectedProjectName');
    localStorage.removeItem('selectedProjectTarget');
    localStorage.removeItem('selectedProjectStatus');
    localStorage.removeItem('selectedProjectFindings');
    localStorage.removeItem('searchInput');
    localStorage.removeItem('searchType');
    localStorage.removeItem('currentModules_selectedId');
    try { localStorage.removeItem('riskCircle_lastState'); } catch (e) {}
    
    // Use requestAnimationFrame to ensure the clear operations are processed before navigation
    requestAnimationFrame(() => {
      navigate('/');
    });
  };

  const handleAnalyze = () => {
    if (!searchInput.trim()) return;
    setIsAnalyzing(true);
    // Note: Actual analysis is handled by the backend after scan start.
    // This UI timer just provides feedback before redirecting to the scan tab.
    setTimeout(() => {
      setIsAnalyzing(false);
      setSearchInput("");
      handleTabChange("scan");
    }, 2000);
  };

  const handleProjectSelect = (project) => {
    if (!project) {
      setSelectedProject(null);
      setProjectRiskScore(0);
      setProjectAlerts([]);
      setRecentScans([]);
      resetRiskData();
      return;
    }
    
    // Clear current project data while loading the new one
    setProjectAlerts([]);
    setRecentScans([]);
    
    setSelectedProject(project);
    setSelectedProjectStatus(project.status || 'idle');
    setSelectedProjectFindings(project.findings || 0);
    setSelectedProjectName(project.name || '');

    // Synchronize risk score with project
    setProjectRiskScore(project.risk_score || 0);
    
    // Clear specific scan risk data when switching projects
    setSelectedRiskData(null);
  };

  const handleRiskDataChange = (riskData, target, name) => {
    if (!riskData) { resetRiskData(); return; }
    setSelectedRiskData(riskData);
    setSelectedProjectName(name || riskData?.scan_name || 'Selected Scan');
    setSelectedProjectTarget(target || riskData?.target || 'No target');
    setSelectedModuleId(riskData?.scan_id);
    if (riskData?.status) setSelectedProjectStatus(riskData.status);
    if (riskData?.findings !== undefined) setSelectedProjectFindings(riskData.findings);
  };

  const getRiskColor = (score) => {
    if (score >= 75) return "text-[#f87171]";
    if (score >= 50) return "text-[#fbbf24]";
    if (score >= 25) return "text-[#00ff88]";
    return "text-[#22d3ee]";
  };

  const getRiskBgColor = (score) => {
    if (score >= 75) return "bg-[#f87171]";
    if (score >= 50) return "bg-[#fbbf24]";
    if (score >= 25) return "bg-[#00ff88]";
    return "bg-[#22d3ee]";
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: "scan", label: "Scan", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { id: "reports", label: "Reports", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: "team", label: "Team", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: "apis", label: "APIs", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: "analytics", label: "Analytics", icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
  ];

  const renderDashboard = () => {
    switch(activeTab) {
      case "dashboard": return <DashboardHome
        riskScore={projectRiskScore}
        getRiskColor={getRiskColor}
        getRiskBgColor={getRiskBgColor}
        recentScans={recentScans}
        alerts={projectAlerts}
        isLoading={isDashboardLoading}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onAnalyzeClick={() => handleTabChange("scan")}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProject?.id}
        selectedRiskData={selectedRiskData}
        selectedProjectName={selectedProjectName}
        selectedProjectTarget={selectedProjectTarget}
        selectedProjectStatus={selectedProjectStatus}
        selectedProjectFindings={selectedProjectFindings}
        onRiskDataChange={handleRiskDataChange}
        refreshTrigger={dashboardRefreshTrigger}
        onRefresh={() => setDashboardRefreshTrigger(prev => prev + 1)}
      />;
      case "scan": return <ScanDashboard
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        recentScans={recentScans}
        alerts={projectAlerts}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
      />;
      case "projects": return <ProjectsDashboard 
        onProjectSelect={handleProjectSelect}
        onTabChange={handleTabChange}
      />;
      case "reports": return <ReportsDashboard />;
      case "team": return <TeamDashboard 
        selectedProject={selectedProject} 
        onProjectSelect={handleProjectSelect}
        onTabChange={handleTabChange}
      />;
      case "integrations": return <IntegrationsDashboard />;
      case "apis": return <APIsDashboard />;
      case "analytics": return <AnalyticsDashboard />;
      default: return <DashboardHome
        riskScore={projectRiskScore}
        getRiskColor={getRiskColor}
        getRiskBgColor={getRiskBgColor}
        recentScans={recentScans}
        alerts={projectAlerts}
        isLoading={isDashboardLoading}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onAnalyzeClick={() => handleTabChange("scan")}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProject?.id}
        selectedRiskData={selectedRiskData}
        selectedProjectName={selectedProjectName}
        selectedProjectTarget={selectedProjectTarget}
        selectedProjectStatus={selectedProjectStatus}
        selectedProjectFindings={selectedProjectFindings}
        onRiskDataChange={handleRiskDataChange}
        refreshTrigger={dashboardRefreshTrigger}
        onRefresh={() => setDashboardRefreshTrigger(prev => prev + 1)}
      />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#000000] text-white overflow-hidden font-mono">
        <main className="flex-1 flex flex-col overflow-hidden bg-[#000000] w-full">
          <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onLogout={handleLogout}
            alertsCount={projectAlerts.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isMobileMenuOpen={isSidebarOpen}
            navItems={navItems}
            selectedProject={selectedProject}
            onPricingClick={() => setPricingOpen(true)}
          />
          <div className="flex-1 overflow-y-auto scrollbar-thin max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]">
            {renderDashboard()}
          </div>
        </main>

        <AccountSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
        <ProductTour 
          isOpen={isTourOpen} 
          onComplete={completeTour} 
          onSkip={completeTour} 
          steps={tourSteps}
        />
      </div>
    </>
  );
};

export default Home;