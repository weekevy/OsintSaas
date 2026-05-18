import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const ShareProjectModal = ({ isOpen, onClose, teamId }) => {
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
      if (response.data.success && response.data.projects) {
        setProjects(response.data.projects);
      } else if (response.data.projects) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
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

  const handleShare = async () => {
    if (!selectedProjectId) {
      setError('Please select a project to share');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/api/teams/${teamId}/share-project`, {
        projectId: selectedProjectId
      });

      if (response.data.success) {
        setSuccess('Project synchronized successfully!');
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share project');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Synchronize Intelligence" size="md">
      <div className="space-y-5 font-['Poppins']">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-[10px] font-semibold">
            {success}
          </div>
        )}

        <div>
          <label className="block text-white/50 text-[10px] font-semibold mb-2 tracking-wider">
            Select Intelligence Asset
          </label>
          
          <div className="mb-3">
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:border-[#00E5FF]/50 transition-colors placeholder-white/20"
            />
          </div>

          {fetching ? (
            <div className="w-full h-11 bg-white/5 animate-pulse rounded-xl" />
          ) : projects.length === 0 ? (
            <div className="w-full px-4 py-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-white/20 text-[10px] font-medium text-center">
              No available projects found for selection.
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:border-[#00E5FF]/50 transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#0a0a0a]">Select an operative's asset...</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id} className="bg-[#0a0a0a]">
                  {project.name} {project.status ? `[${project.status.toUpperCase()}]` : ''}
                </option>
              ))}
            </select>
          )}
          
          {filteredProjects.length === 0 && projects.length > 0 && (
            <p className="mt-2 text-[10px] text-white/20 italic text-center">
              No matching assets found for "{searchTerm}"
            </p>
          )}
          
          <p className="mt-4 text-[9px] text-white/20 italic leading-relaxed">
            Note: Sharing an asset will provide all cleared personnel in this team with collaborative access and visualization capabilities.
          </p>
        </div>

        <div className="flex gap-3 pt-6 border-t border-white/5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black tracking-widest"
          >
            ABORT
          </button>
          <button
            onClick={handleShare}
            disabled={loading || fetching || !selectedProjectId}
            className="flex-[1.5] px-4 py-3 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-black rounded-xl hover:brightness-110 transition-all text-[10px] font-black tracking-widest disabled:opacity-30 disabled:grayscale"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
            ) : (
              'SYNCHRONIZE'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareProjectModal;
