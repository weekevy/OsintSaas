import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  MobileSidebar,
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

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("url");
  const [recentScans, setRecentScans] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // State for project selection
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRiskScore, setProjectRiskScore] = useState(0);
  const [projectAlerts, setProjectAlerts] = useState([]);

  // Mock data
  useEffect(() => {
    setRecentScans([
      // { id: 1, target: "suspicious-company.com", type: "url", date: "2 min ago", risk: 85 },
      // { id: 2, target: "hr@scam-recruitment.org", type: "email", date: "15 min ago", risk: 92 },
      // { id: 3, target: "fake-resume.pdf", type: "file", date: "1 hour ago", risk: 67 },
      // { id: 4, target: "secure-bank-login.com", type: "url", date: "3 hours ago", risk: 95 },
    ]);

    setAlerts([
      // { id: 1, severity: "critical", message: "This domain is associated with known phishing campaigns", source: "Threat Intelligence", time: "2 min ago", projectId: 1 },
      // { id: 2, severity: "high", message: "Email address found in 3 data breaches", source: "Breach Database", time: "15 min ago", projectId: 2 },
      // { id: 3, severity: "warning", message: "SSL certificate expired 45 days ago", source: "Certificate Transparency", time: "1 hour ago", projectId: 1 },
      // { id: 4, severity: "medium", message: "Unusual login patterns detected", source: "Activity Monitor", time: "30 min ago", projectId: 3 },
    ]);

    setRiskScore(1);
    setProjectRiskScore(78);
    setProjectAlerts(alerts);
  }, []);

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
      setActiveTab("scan");
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


//     { 
//       id: "projects", 
//       label: "Projects", 
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//         </svg>
//       )
//     },


    { 
      id: "reports", 
      label: "Reports", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    // { 
    //   id: "integrations", 
    //   label: "Integrations", 
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    //     </svg>
    //   )
    // },
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
            onAnalyzeClick={() => setActiveTab("scan")}
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProject?.id}
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
        return <DashboardHome 
          riskScore={projectRiskScore}
          getRiskColor={getRiskColor}
          getRiskBgColor={getRiskBgColor}
          recentScans={recentScans}
          alerts={projectAlerts}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onAnalyzeClick={() => setActiveTab("scan")}
          onProjectSelect={handleProjectSelect}
          selectedProjectId={selectedProject?.id}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={navItems}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={navItems}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-black via-purple-950/5 to-black w-full">
        
        {/* Top Bar */}
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
          onTabChange={setActiveTab}
          isMobileMenuOpen={isSidebarOpen}
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
  );
};

export default Home;
