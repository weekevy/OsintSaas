import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const JoinTeam = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (token) {
      verifyInvite();
    } else {
      setError('No invitation token provided');
      setLoading(false);
    }
  }, [token]);

  const verifyInvite = async () => {
    try {
      const response = await api.get(`/api/teams/join?token=${token}`);
      if (response.data.success) {
        setInvitation(response.data.invitation);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Redirect to login with redirect back here
      navigate(`/?redirect=/join-team?token=${token}`);
      return;
    }

    setJoining(true);
    try {
      const response = await api.post('/api/teams/join', { token });
      if (response.data.success) {
        navigate('/home?tab=team');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-['Poppins']">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,229,255,0.1)]">
        <div className="w-20 h-20 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        {error ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Invitation Error</h1>
            <p className="text-white/40 mb-8">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
            >
              Go to Homepage
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">You're Invited!</h1>
            <p className="text-white/40 mb-6">
              You've been invited to join <span className="text-[#00E5FF] font-bold">{invitation?.team_name}</span> as a <span className="text-white font-semibold uppercase">{invitation?.role}</span>.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {joining ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  isAuthenticated ? 'Accept Invitation' : 'Login to Join'
                )}
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-3 text-white/40 hover:text-white transition-colors text-sm font-medium"
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;
