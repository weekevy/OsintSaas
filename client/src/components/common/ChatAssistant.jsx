import React, { useState, useEffect, useRef } from 'react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Weekey, your OSINT assistant. How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleMessage, setBubbleMessage] = useState('');
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const welcomeMessages = [
    "NEED HELP?",
    "READY TO SCAN?",
    "HOW CAN I HELP?",
    "CATCH SCAMMERS!",
    "OSINT ASSISTANCE?",
    "INVESTIGATE NOW?",
    "ASK ME ANYTHING!",
    "NEED ASSISTANCE?",
    "LOOKING FOR SOMETHING?",
    "I'M HERE TO HELP!"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setBubbleMessage(randomMessage);
    setBubbleIndex(Math.floor(Math.random() * welcomeMessages.length));
    
    const interval = setInterval(() => {
      setBubbleIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % welcomeMessages.length;
        setBubbleMessage(welcomeMessages[newIndex]);
        return newIndex;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      return "Hey there! I'm Weekey, your OSINT assistant. Ready to help you investigate and catch scammers! What do you need help with today?";
    } else if (msg.includes('scan') || msg.includes('investigate')) {
      return "To start a scan, go to the Scan Dashboard and click on any investigation module. You can analyze job scams, LinkedIn profiles, social media, websites, and more!";
    } else if (msg.includes('job') || msg.includes('scam')) {
      return "Our Job Scam Check module helps verify if a job offer, company, or recruiter is legitimate. You can add job details, company information, and upload evidence.";
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('credit')) {
      return "Each scan costs 1 credit. You can purchase credits from your account settings. Check your current credits in the top bar!";
    } else if (msg.includes('help')) {
      return "I can help you with:\n• Starting investigations\n• Understanding scan results\n• Managing your account\n• Troubleshooting issues\n\nWhat would you like to know?";
    } else if (msg.includes('account') || msg.includes('profile')) {
      return "You can manage your account settings by clicking on your avatar in the top right corner. There you can update your profile, change password, and manage credits.";
    } else if (msg.includes('thank')) {
      return "You're welcome! Happy to help. Let me know if you need anything else!";
    } else {
      return "Thanks for your message! I'm here to help with OSINT investigations, scam detection, and any questions about Weekey. What would you like to know?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // SVG Icons with Weekey Green Color
  const BotIcon = () => (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-5 h-5 text-white/60 hover:text-[#00ff88] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const SendIcon = () => (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const WeekeyIcon = () => (
    <svg className="w-7 h-7 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none"/>
      <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
    </svg>
  );

  const ChatBubbleIcon = () => (
    <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {showBubble && !isOpen && (
          <div className="absolute bottom-16 sm:bottom-20 right-0 mb-2 animate-fade-in-up">
            <div className="relative bg-[#090c0e] border border-[#00ff88]/40 text-white px-4 py-2.5 shadow-2xl">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff88]/60" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff88]/60" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff88]/60" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff88]/60" />
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.08em] text-[#00ff88] whitespace-nowrap">{bubbleMessage}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#090c0e] border border-[#00ff88]/40 hover:border-[#00ff88] transition-all duration-300 flex items-center justify-center group"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff88]/60" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff88]/60" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff88]/60" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff88]/60" />
          
          {isOpen ? (
            <CloseIcon />
          ) : (
            <ChatBubbleIcon />
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 z-40 lg:hidden animate-fade-in" onClick={() => setIsOpen(false)} />
          
          <div 
            ref={chatWindowRef}
            className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 lg:w-[420px] xl:w-[460px] lg:h-[560px] xl:h-[600px] bg-[#090c0e] border border-[#00ff88]/20 z-50 flex flex-col animate-slide-up overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#00ff88]/30 flex items-center justify-center bg-[#0d1114]">
                  <WeekeyIcon />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Weekey Assistant</h3>
                  <p className="text-[#00ff88] text-xs font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse"></span>
                    ONLINE • READY
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-[#00ff88] transition-colors">
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0 mr-2 bg-[#0d1114]">
                      <BotIcon />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-white'
                        : 'bg-white/5 border border-white/10 text-white/90'
                    }`}
                  >
                    <p className="text-sm font-mono whitespace-pre-wrap break-words">{message.text}</p>
                    <span className="text-[10px] opacity-50 mt-1 block font-mono">
                      {message.time}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0 ml-2 bg-[#0d1114]">
                      <UserIcon />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0 mr-2 bg-[#0d1114]">
                    <BotIcon />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2.5 bg-[#0d1114] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="text-white/30 text-[10px] font-mono text-center mt-2 uppercase tracking-wider">
                Press Enter to send
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-bounce { animation: bounce 0.6s infinite; }
        
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 255, 136, 0.3) rgba(255, 255, 255, 0.05);
        }
        
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(0, 255, 136, 0.3); }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 136, 0.5); }
      `}</style>
    </>
  );
};

export default ChatAssistant;