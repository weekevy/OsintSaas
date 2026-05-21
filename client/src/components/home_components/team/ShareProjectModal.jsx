import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const ShareProjectModal = ({ isOpen, onClose, teamId, currentProject }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setFetching(true);
    setError('');
    try {
      // Fetch all projects owned by the user
      const response = await api.get('/api/projects');
      const allProjects = response.data.projects || [];
      
      // Filter out projects already shared with THIS team
      const shareableProjects = allProjects.filter(p => p.team_id !== parseInt(teamId));
      
      setProjects(shareableProjects);

      // Pre-select current project if it's available
      if (currentProject) {
        setSelectedProjectId(currentProject.id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load your projects');
    } finally {
      setFetching(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShare = async (projectId) => {
    const pId = projectId || selectedProjectId;
    if (!pId) {
      setError('Please select a project to share');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/api/teams/${teamId}/share-project`, {
        projectId: pId
      });

      if (response.data.success) {
        setSuccess('Intelligence asset synchronized successfully!');
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to synchronize asset');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProjectId('');
    setSearchTerm('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Synchronize Intelligence Assets" size="lg">
      <div className="space-y-6 font-sans">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl text-[#00E5FF] text-sm font-semibold">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-white/60 text-sm font-semibold tracking-wider uppercase">
              Select Project to Share
            </h4>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Filter projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-[#00E5FF]/50 transition-colors placeholder-white/20"
              />
            </div>
          </div>

          {fetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="w-full px-6 py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-white/20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center">
                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-white/40">No shareable projects found</p>
                <p className="text-xs opacity-50 mt-1">All your projects are already synchronized or none exist.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {filteredProjects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative p-5 rounded-[24px] border transition-all cursor-pointer ${
                    selectedProjectId === project.id 
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 ring-1 ring-[#00E5FF]/20' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      selectedProjectId === project.id 
                        ? 'bg-[#00E5FF]/20 border-[#00E5FF]/30 text-[#00E5FF]' 
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      <span className="text-lg font-bold">{project.name[0]}</span>
                    </div>
                    <span className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border ${
                      project.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <h5 className={`text-sm font-bold truncate mb-1 transition-colors ${
                    selectedProjectId === project.id ? 'text-[#00E5FF]' : 'text-white'
                  }`}>
                    {project.name}
                  </h5>
                  <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed mb-4">
                    {project.description || 'No intelligence briefing provided.'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-black flex items-center justify-center text-[8px] font-bold text-white/40">
                        {project.asset_count || 0}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-white/20 tracking-wider">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedProjectId === project.id && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#00E5FF] text-black rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="p-4 bg-[#00E5FF]/[0.02] border border-[#00E5FF]/10 rounded-2xl flex gap-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              <span className="text-[#00E5FF]/60 font-bold uppercase tracking-wider mr-1">Sharing Policy:</span>
              Synchronizing a project will share all intelligence assets, scan results, and reports with every member of this squad. This action is irreversible.
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-6 py-4 border border-white/10 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-xs font-black tracking-widest"
          >
            ABORT
          </button>
          <button
            onClick={() => handleShare()}
            disabled={loading || fetching || !selectedProjectId}
            className="flex-[1.5] px-6 py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-black rounded-xl hover:brightness-110 transition-all text-xs font-black tracking-widest disabled:opacity-30 disabled:grayscale shadow-[0_0_30px_rgba(0,229,255,0.15)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
            ) : (
              'SYNC COMPLETE PROJECT'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareProjectModal;
