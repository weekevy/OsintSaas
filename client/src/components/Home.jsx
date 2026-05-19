import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const [riskScore, setRiskScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState(() => ls('timeRange', 'week'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      const tourKey = `hasSeenTour_${user.email}`;
      const hasSeenTour = localStorage.getItem(tourKey);
      if (!hasSeenTour) {
        const timer = setTimeout(() => setIsTourOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const completeTour = () => {
    if (user?.email) {
      setIsTourOpen(false);
      localStorage.setItem(`hasSeenTour_${user.email}`, 'true');
    }
  };

  // ── All project-related state initialised directly from localStorage ──
  // This is the key fix: no useEffect delay means RiskCircle gets the correct
  // values on the very first render, eliminating the idle flicker on refresh.
  const [selectedProject, setSelectedProject] = useState(() => {
    const p = lsJson('selectedProject', null);
    return p && p.id ? p : null;
  });
  const [projectRiskScore, setProjectRiskScore] = useState(0);
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
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  // ── Fetch Alerts whenever project or trigger changes ──
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let url = '/api/dashboard/alerts';
        if (selectedProject?.id) {
          url += `?projectId=${selectedProject.id}`;
        }
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        if (response.ok) {
          setAlerts(data.alerts || []);
          if (selectedProject) {
            setProjectAlerts(data.alerts || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
  }, [selectedProject?.id, dashboardRefreshTrigger]);

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
    
    navigate('/');
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
      resetRiskData();
      return;
    }
    setSelectedProject(project);
    setSelectedProjectStatus(project.status || 'idle');
    setSelectedProjectFindings(project.findings || 0);

    // Initial risk score before scan data is fetched
    setProjectRiskScore(0);
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
      />;
      case "projects": return <ProjectsDashboard />;
      case "reports": return <ReportsDashboard />;
      case "team": return <TeamDashboard />;
      case "integrations": return <IntegrationsDashboard />;
      case "apis": return <APIsDashboard />;
      case "analytics": return <AnalyticsDashboard />;
      default: return <DashboardHome
        riskScore={projectRiskScore}
        getRiskColor={getRiskColor}
        getRiskBgColor={getRiskBgColor}
        recentScans={recentScans}
        alerts={projectAlerts}
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
      <div className="flex h-screen bg-[#080b0d] text-white overflow-hidden font-mono">
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080b0d] w-full">
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
          />
          <div className="flex-1 overflow-y-auto scrollbar-thin max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]">
            {renderDashboard()}
          </div>
        </main>
        <AccountSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <ProductTour 
          isOpen={isTourOpen} 
          onComplete={completeTour} 
          onSkip={completeTour} 
        />
      </div>
    </>
  );
};

export default Home;