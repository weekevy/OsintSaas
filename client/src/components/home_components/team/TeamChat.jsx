import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/teams/${teamId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/api/teams/${teamId}/messages`, {
        content: newMessage
      });
      if (response.data.success) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4" />
      <span className="text-[10px] font-bold text-white/20 tracking-[0.2em]">CONNECTING TO SECURE CHANNEL...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[700px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-8 no-scrollbar pb-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-xs font-bold tracking-[0.3em]">NO ACTIVE TRANSMISSIONS</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-3 mb-2 px-1">
                {!msg.is_me && (
                  <div className="w-6 h-6 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[10px] font-bold text-[#00E5FF]">
                    {(msg.first_name || msg.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] font-bold text-white/40 tracking-wider">
                  {msg.is_me ? 'YOU' : (msg.first_name || msg.email.split('@')[0]).toUpperCase()}
                </span>
                <span className="text-[9px] text-white/10 font-medium">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className={`group relative max-w-[75%] px-6 py-4 rounded-3xl text-[13px] leading-relaxed shadow-xl ${
                msg.is_me 
                  ? 'bg-[#00E5FF] text-black font-semibold rounded-tr-none' 
                  : 'bg-white/[0.03] border border-white/10 text-white/80 rounded-tl-none hover:bg-white/[0.05]'
              } transition-all duration-300`}>
                {msg.content}
                
                {/* Visual Read Receipt Decoration */}
                <div className={`absolute bottom-[-20px] ${msg.is_me ? 'right-0' : 'left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-40 transition-opacity duration-300`}>
                  <div className="flex -space-x-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-3 h-3 rounded-full border border-[#0a0a0a] bg-[#2DD4BF]" />
                    ))}
                  </div>
                  <span className="text-[8px] font-bold text-[#2DD4BF] tracking-widest ml-1">SEEN BY OPS</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Bar */}
      <div className="pt-6">
        <form onSubmit={handleSendMessage} className="relative group">
          <div className="absolute inset-0 bg-[#00E5FF]/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a secure transmission..."
            className="w-full pl-8 pr-20 py-5 bg-white/[0.03] border border-white/10 rounded-[28px] text-[13px] text-white placeholder-white/10 focus:outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.05] transition-all relative z-10"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-3 top-3 bottom-3 px-6 bg-[#00E5FF] text-black rounded-[22px] flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
