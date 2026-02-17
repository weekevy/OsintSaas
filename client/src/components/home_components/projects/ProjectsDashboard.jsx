import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard'; // Make sure this path is correct!
import CreateProjectModal from './CreateProjectModal';
import ProjectStats from './ProjectStats';

const ProjectsDashboard = () => {
  console.log('📊 ProjectsDashboard LOADED');
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    critical: 0
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    console.log('Fetching projects...');
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        setError(`Failed to load projects: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('Projects fetched:', data.projects);
      setProjects(data.projects || []);
      calculateStats(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateStats = (projectsData) => {
    const stats = {
      total: projectsData.length,
      active: projectsData.filter(p => p.status === 'active').length,
      completed: projectsData.filter(p => p.status === 'completed').length,
      critical: projectsData.filter(p => p.priority === 'critical').length
    };
    setStats(stats);
  };

  const handleCreateProject = async (projectData) => {
    console.log('handleCreateProject called with:', projectData);
    setError('');
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const text = await response.text();
      console.log('Raw response:', text);
      
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', text);
          setError('Server returned invalid response');
          return;
        }
      }

      if (response.ok) {
        await fetchProjects();
        setIsModalOpen(false);
        setError('');
      } else {
        setError(data.error || `Error ${response.status}: Failed to create project`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditProject = async (projectData) => {
    console.log('handleEditProject called with:', projectData);
    setError('');
    
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

      const text = await response.text();
      console.log('Raw response:', text);
      
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', text);
          setError('Server returned invalid response');
          return;
        }
      }

      if (response.ok) {
        await fetchProjects();
        setEditingProject(null);
        setIsModalOpen(false);
        setError('');
      } else {
        setError(data.error || `Error ${response.status}: Failed to update project`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteProject = async (project) => {
    console.log('🗑️ handleDeleteProject called for:', project.name);
    
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    setError('');
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const text = await response.text();
      console.log('Raw response:', text);
      
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', text);
        }
      }

      if (response.ok) {
        await fetchProjects();
        setError('');
      } else {
        setError(data.error || `Error ${response.status}: Failed to delete project`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditClick = (project) => {
    console.log('✏️ handleEditClick called for:', project.name);
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // DEBUG: Log handlers before rendering
  console.log('📢 Handlers status:', {
    handleEditClick: !!handleEditClick,
    handleDeleteProject: !!handleDeleteProject,
    handleCreateProject: !!handleCreateProject,
    handleEditProject: !!handleEditProject
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-white/60 text-sm mt-1">Manage and track your OSINT investigations</p>
        </div>
        <button
          onClick={() => {
            console.log('New project button clicked');
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Project
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Section */}
      <ProjectStats stats={stats} />

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-white font-medium text-lg mb-2">No projects yet</h3>
          <p className="text-white/40 mb-4">Create your first project to start investigating</p>
          <button
            onClick={() => {
              console.log('Create project from empty state');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            console.log('🔵 Rendering ProjectCard for:', project.name, 'with handlers:', {
              onEdit: !!handleEditClick,
              onDelete: !!handleDeleteProject
            });
            return (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditClick}
                onDelete={handleDeleteProject}
                onView={(proj) => console.log('View:', proj)}
              />
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing modal');
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={(data) => {
          console.log('Modal onSubmit received:', data);
          console.log('Current editingProject:', editingProject);
          if (editingProject) {
            console.log('Calling handleEditProject');
            handleEditProject({ ...data, id: editingProject.id });
          } else {
            console.log('Calling handleCreateProject');
            handleCreateProject(data);
          }
        }}
        initialData={editingProject}
      />
    </div>
  );
};

export default ProjectsDashboard;
