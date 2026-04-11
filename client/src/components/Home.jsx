import { useState, useEffect } from "react";
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
  
  // Get tab from URL query parameter
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
  
  // State for project selection
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRiskScore, setProjectRiskScore] = useState(0);
  const [projectAlerts, setProjectAlerts] = useState([]);
  
  // NEW: State for risk data from CurrentModules
  const [selectedRiskData, setSelectedRiskData] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedProjectTarget, setSelectedProjectTarget] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromUrl();
      setActiveTab(tab);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

  // Simulate page loading on refresh
  useEffect(() => {
    // Show progress bar on page load/refresh
    setIsPageLoading(true);
    
    // Simulate loading time for data restoration
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800); // Adjust this time based on your actual loading needs
    
    return () => clearTimeout(timer);
  }, []);

  // Load saved data from localStorage on mount
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
    if (savedSelectedProject) setSelectedProject(JSON.parse(savedSelectedProject));
    if (savedSelectedRiskData) setSelectedRiskData(JSON.parse(savedSelectedRiskData));
    if (savedSelectedProjectName) setSelectedProjectName(savedSelectedProjectName);
    if (savedSelectedProjectTarget) setSelectedProjectTarget(savedSelectedProjectTarget);
    
    setRecentScans([]);
    setAlerts([]);
    setRiskScore(1);
    setProjectRiskScore(78);
    setProjectAlerts(alerts);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('searchInput', searchInput);
  }, [searchInput]);

  useEffect(() => {
    localStorage.setItem('searchType', searchType);
  }, [searchType]);

  useEffect(() => {
    localStorage.setItem('timeRange', timeRange);
  }, [timeRange]);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedRiskData) {
      localStorage.setItem('selectedRiskData', JSON.stringify(selectedRiskData));
    }
  }, [selectedRiskData]);

  useEffect(() => {
    localStorage.setItem('selectedProjectName', selectedProjectName);
  }, [selectedProjectName]);

  useEffect(() => {
    localStorage.setItem('selectedProjectTarget', selectedProjectTarget);
  }, [selectedProjectTarget]);

  // Listen for openSettings event from UserMenu
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };

    window.addEventListener('openSettings', handleOpenSettings);
    
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
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
      
      setRecentScans(prev => [
        { 
          id: Date.now(), 
          target: searchInput, 
          type: searchType, 
          date: "Just now", 
          risk: randomRisk 
        },
        ...prev.slice(0, 4)
      ]);
      
      setIsAnalyzing(false);
      setSearchInput("");
      
      // Switch to scan tab to show results
      handleTabChange("scan");
    }, 2000);
  };

  // Project selection handler
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    
    // Calculate risk score based on project priority
    const calculatedRisk = calculateProjectRisk(project);
    setProjectRiskScore(calculatedRisk);
    
    // Filter alerts for this project
    const filteredAlerts = filterAlertsByProject(project.id);
    setProjectAlerts(filteredAlerts);
    
    console.log('Selected project:', project);
    console.log('Project risk:', calculatedRisk);
    console.log('Project alerts:', filteredAlerts);
  };

  // NEW: Handler for risk data change from CurrentModules
  const handleRiskDataChange = (riskData, target, name) => {
    console.log('Risk data received from CurrentModules:', riskData);
    setSelectedRiskData(riskData);
    setSelectedProjectName(name || riskData?.scan_name || 'Selected Scan');
    setSelectedProjectTarget(target || riskData?.target || 'No target');
    setSelectedModuleId(riskData?.scan_id);
  };

  // Helper function to calculate project risk
  const calculateProjectRisk = (project) => {
    const priorityWeights = { 
      critical: 90, 
      high: 70, 
      medium: 50, 
      low: 30 
    };
    
    const baseRisk = priorityWeights[project.priority] || 50;
    const progressFactor = (100 - (project.progress || 0)) * 0.2;
    
    return Math.min(100, Math.round(baseRisk + progressFactor));
  };

  // Helper function to filter alerts by project
  const filterAlertsByProject = (projectId) => {
    return alerts.filter(alert => alert.projectId === projectId);
  };

  const getRiskColor = (score) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBgColor = (score) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: "scan", 
      label: "Scan", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    // { 
    //   id: "projects", 
    //   label: "Projects", 
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //     </svg>
    //   )
    // },
    { 
      id: "reports", 
      label: "Reports", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: "team", 
      label: "Team", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: "apis", 
      label: "APIs", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Render the active dashboard
  const renderDashboard = () => {
    switch(activeTab) {
      case "dashboard":
        return (
          <DashboardHome 
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
            onRiskDataChange={handleRiskDataChange}
          />
        );
      case "scan":
        return (
          <ScanDashboard 
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            recentScans={recentScans}
            alerts={projectAlerts}
            selectedProject={selectedProject}
          />
        );
      case "projects":
        return <ProjectsDashboard />;
      case "reports":
        return <ReportsDashboard />;
      case "team":
        return <TeamDashboard />;
      case "integrations":
        return <IntegrationsDashboard />;
      case "apis":
        return <APIsDashboard />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return (
          <DashboardHome 
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
            onRiskDataChange={handleRiskDataChange}
          />
        );
    }
  };

  return (
    <>
      {/* Progress Bar */}
      <ProgressBar isLoading={isPageLoading} />
      
      <div className="flex h-screen bg-black text-white overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-black via-purple-950/5 to-black w-full">
          
          {/* Top Bar with Navigation */}
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
          />

          {/* Dynamic Dashboard Content */}
          <div className="flex-1 overflow-y-auto">
            {renderDashboard()}
          </div>
        </main>

        {/* Account Settings Modal */}
        <AccountSettings 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </>
  );
};

export default Home;