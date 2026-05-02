import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import ProgressBar from "./home_components/common/ProgressBar";

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
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("url");
  const [recentScans, setRecentScans] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRiskScore, setProjectRiskScore] = useState(0);
  const [projectAlerts, setProjectAlerts] = useState([]);
  const [selectedRiskData, setSelectedRiskData] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedProjectTarget, setSelectedProjectTarget] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    document.body.style.fontFamily = "'Inter', sans-serif";
    return () => { };
  }, []);

  const resetRiskData = () => {
    setSelectedRiskData(null);
    setSelectedProjectName('');
    setSelectedProjectTarget('');
    setSelectedModuleId(null);
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
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') setDashboardRefreshTrigger(prev => prev + 1);
  }, [activeTab]);

  useEffect(() => {
    const autoSelectProject = async () => {
      const savedSelectedProject = localStorage.getItem('selectedProject');
      if (savedSelectedProject) return; // Already have a selection

      try {
        const response = await fetch('/api/projects', { credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.projects?.length > 0) {
          // Select the first created project
          const firstProject = data.projects[0];
          handleProjectSelect(firstProject);
        }
      } catch (error) {
        console.error('Auto-select failed:', error);
      }
    };
    autoSelectProject();
  }, []);

  useEffect(() => {
    const savedSearchInput = localStorage.getItem('searchInput');
    const savedSearchType = localStorage.getItem('searchType');
    const savedTimeRange = localStorage.getItem('timeRange');
    const savedSelectedProject = localStorage.getItem('selectedProject');
    const savedSelectedRiskData = localStorage.getItem('selectedRiskData');
    const savedSelectedProjectName = localStorage.getItem('selectedProjectName');
    const savedSelectedProjectTarget = localStorage.getItem('selectedProjectTarget');
    
    if (savedSearchInput) setSearchInput(savedSearchInput);
    if (savedSearchType) setSearchType(savedSearchType);
    if (savedTimeRange) setTimeRange(savedTimeRange);
    
    if (savedSelectedProject) {
      try {
        const project = JSON.parse(savedSelectedProject);
        if (project && project.id) {
          setSelectedProject(project);
          if (savedSelectedRiskData) setSelectedRiskData(JSON.parse(savedSelectedRiskData));
          if (savedSelectedProjectName) setSelectedProjectName(savedSelectedProjectName);
          if (savedSelectedProjectTarget) setSelectedProjectTarget(savedSelectedProjectTarget);
        } else { resetRiskData(); setSelectedProject(null); }
      } catch (e) { resetRiskData(); setSelectedProject(null); }
    } else { resetRiskData(); setSelectedProject(null); }
    
    setRecentScans([]);
    setAlerts([]);
    setRiskScore(1);
    setProjectRiskScore(78);
    setProjectAlerts(alerts);
  }, []);

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
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener('openSettings', handleOpenSettings);
    return () => window.removeEventListener('openSettings', handleOpenSettings);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAnalyze = () => {
    if (!searchInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const randomRisk = Math.floor(Math.random() * 100);
      setRiskScore(randomRisk);
      setProjectRiskScore(randomRisk);
      setRecentScans(prev => [{ id: Date.now(), target: searchInput, type: searchType, date: "Just now", risk: randomRisk }, ...prev.slice(0, 4)]);
      setIsAnalyzing(false);
      setSearchInput("");
      handleTabChange("scan");
    }, 2000);
  };

  const handleProjectSelect = (project) => {
    if (!project) { setSelectedProject(null); setProjectRiskScore(0); setProjectAlerts([]); resetRiskData(); return; }
    setSelectedProject(project);
    const priorityWeights = { critical: 90, high: 70, medium: 50, low: 30 };
    const baseRisk = priorityWeights[project.priority] || 50;
    const progressFactor = (100 - (project.progress || 0)) * 0.2;
    setProjectRiskScore(Math.min(100, Math.round(baseRisk + progressFactor)));
    setProjectAlerts(alerts.filter(alert => alert.projectId === project.id));
  };

  const handleRiskDataChange = (riskData, target, name) => {
    if (!riskData) { resetRiskData(); return; }
    setSelectedRiskData(riskData);
    setSelectedProjectName(name || riskData?.scan_name || 'Selected Scan');
    setSelectedProjectTarget(target || riskData?.target || 'No target');
    setSelectedModuleId(riskData?.scan_id);
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
      case "dashboard": return <DashboardHome riskScore={projectRiskScore} getRiskColor={getRiskColor} getRiskBgColor={getRiskBgColor} recentScans={recentScans} alerts={projectAlerts} timeRange={timeRange} onTimeRangeChange={setTimeRange} onAnalyzeClick={() => handleTabChange("scan")} onProjectSelect={handleProjectSelect} selectedProjectId={selectedProject?.id} selectedRiskData={selectedRiskData} selectedProjectName={selectedProjectName} selectedProjectTarget={selectedProjectTarget} onRiskDataChange={handleRiskDataChange} refreshTrigger={dashboardRefreshTrigger} />;
      case "scan": return <ScanDashboard searchInput={searchInput} onSearchChange={setSearchInput} searchType={searchType} onSearchTypeChange={setSearchType} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} recentScans={recentScans} alerts={projectAlerts} selectedProject={selectedProject} />;
      case "projects": return <ProjectsDashboard />;
      case "reports": return <ReportsDashboard />;
      case "team": return <TeamDashboard />;
      case "integrations": return <IntegrationsDashboard />;
      case "apis": return <APIsDashboard />;
      case "analytics": return <AnalyticsDashboard />;
      default: return <DashboardHome riskScore={projectRiskScore} getRiskColor={getRiskColor} getRiskBgColor={getRiskBgColor} recentScans={recentScans} alerts={projectAlerts} timeRange={timeRange} onTimeRangeChange={setTimeRange} onAnalyzeClick={() => handleTabChange("scan")} onProjectSelect={handleProjectSelect} selectedProjectId={selectedProject?.id} selectedRiskData={selectedRiskData} selectedProjectName={selectedProjectName} selectedProjectTarget={selectedProjectTarget} onRiskDataChange={handleRiskDataChange} refreshTrigger={dashboardRefreshTrigger} />;
    }
  };

  return (
    <>
      <ProgressBar isLoading={isPageLoading} />
      <div className="flex h-screen bg-[#080b0d] text-white overflow-hidden font-mono">
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080b0d] w-full">
          <TopBar onMenuClick={() => setIsSidebarOpen(true)} searchInput={searchInput} onSearchChange={setSearchInput} searchType={searchType} onSearchTypeChange={setSearchType} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} onLogout={handleLogout} alertsCount={projectAlerts.length} activeTab={activeTab} onTabChange={handleTabChange} isMobileMenuOpen={isSidebarOpen} navItems={navItems} />
          <div className="flex-1 overflow-y-auto">{renderDashboard()}</div>
        </main>
        <AccountSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </>
  );
};

export default Home;