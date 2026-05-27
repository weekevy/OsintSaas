import { useState, useEffect } from 'react';
import { ProjectCard, CreateProjectModal, ProjectStats } from '../projects';
import ProjectDetailsModal from '../projects/ProjectDetailsModal';
import DeleteConfirmationModal from '../projects/DeleteConfirmationModal';

const ProjectsDashboard = ({ onProjectSelect, onTabChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    criticalThreats: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects);
        calculateStats(data.projects);
      } else {
        setError(data.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectsData) => {
    const stats = {
      totalProjects: projectsData.length,
      activeProjects: projectsData.filter(p => p.status === 'active').length,
      completedProjects: projectsData.filter(p => p.status === 'completed').length,
      criticalThreats: projectsData.filter(p => p.threatLevel === 'critical').length
    };
    setStats(stats);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProjects();
        setIsCreateModalOpen(false);
        setEditingProject(null);
        
        // Auto-select the new project and go to scan tab
        if (data.project && onProjectSelect) {
          onProjectSelect(data.project);
          if (onTabChange) onTabChange('scan');
        }
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const response = await fetch(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          dueDate: projectData.dueDate,
          icon: projectData.icon,
          color: projectData.color
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProjects();
        setEditingProject(null);
        setIsCreateModalOpen(false);
      } else {
        setError(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProject) return;
    
    console.log('✅ Delete confirmed for:', deleteProject.name);
    setError('');
    
    try {
      const response = await fetch(`/api/projects/${deleteProject.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const text = await response.text();
      console.log('📥 Response:', text);
      
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response:', e);
        }
      }

      if (response.ok) {
        await fetchProjects();
        setDeleteProject(null);
        setError('');
      } else {
        setError(data.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setIsCreateModalOpen(true);
  };

  const handleViewClick = (project) => {
    console.log('👁️ Selecting project and navigating:', project.name);
    if (onProjectSelect) onProjectSelect(project);
    if (onTabChange) onTabChange('scan');
  };

  const handleDeleteClick = (project) => {
    console.log('🗑️ Delete clicked for:', project.name);
    setDeleteProject(project);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 font-sans animate-slide-up">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
            <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight">Active Projects</h1>
          </div>
          <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Manage and track your OSINT investigation projects.</p>
        </div>
        
        <button
          onClick={() => {
            setEditingProject(null);
            setIsCreateModalOpen(true);
          }}
          className="group relative w-full md:w-auto px-8 py-3.5 lg:py-4 bg-[#00E5FF] text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.2)] text-[10px] lg:text-xs font-sans uppercase tracking-widest"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Assemble project
          </div>
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Project Stats */}
      <ProjectStats stats={stats} />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#00E5FF] rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-black rounded-2xl border border-white/5">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-white font-medium text-lg mb-2">No projects yet</h3>
          <p className="text-white/40 mb-4">Create your first project to start investigating</p>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg transition-all"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onView={handleViewClick}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleEditProject : handleCreateProject}
        initialData={editingProject}
      />

      {/* View Details Modal */}
      <ProjectDetailsModal
        isOpen={viewingProject !== null}
        onClose={() => setViewingProject(null)}
        project={viewingProject}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteProject !== null}
        onClose={() => setDeleteProject(null)}
        onConfirm={handleDeleteConfirm}
        projectName={deleteProject?.name}
      />
    </div>
  );
};

export default ProjectsDashboard;
