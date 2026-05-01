import React, { useState, useEffect, useRef } from 'react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the Intelligence Terminal. I am your OSINT assistant. How may I assist your investigation today?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleMessage, setBubbleMessage] = useState("Operational Assistance?");
  
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const welcomeMessages = [
    "NEED ASSISTANCE?",
    "READY TO INVESTIGATE?",
    "SYSTEMS ONLINE",
    "CATCH THE FRAUD",
    "OSINT TERMINAL READY"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbleMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const getBotResponse = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('hi') || msg.includes('hello')) return "Greetings, Investigator. All modules are currently operational. What is your objective?";
    if (msg.includes('scan') || msg.includes('how')) return "To initiate a scan, please authenticate and access the Command Dashboard. From there, select a specific OSINT module.";
    if (msg.includes('price') || msg.includes('cost')) return "Each investigation requires 1 Operation Credit. You can monitor your allocation in the User Terminal.";
    return "Intelligence noted. For specific technical queries, please refer to the API documentation or contact SecOps.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Floating Action Button */}
      <div className="flex flex-col items-end">
        {showBubble && !isOpen && (
          <div
            className="mb-4 mr-2"
          >
            <div className="glass-card px-4 py-2 rounded-2xl border-[#00E5FF]/20">
              <p className="text-[10px] font-black tracking-[0.15em] text-[#00E5FF] uppercase whitespace-nowrap">
                {bubbleMessage}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            isOpen ? 'bg-white text-black' : 'bg-black border border-white/10 text-[#00E5FF] hover:border-[#00E5FF]/50'
          }`}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
          {!isOpen && <div className="absolute inset-0 rounded-full border-beam" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-28 right-6 w-[90vw] sm:w-[400px] h-[600px] glass-card rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
        >
          <div className="border-beam" />
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-black text-lg tracking-tight">Weekey AI</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest">Active Link</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] ${
                  msg.sender === 'user' 
                    ? 'bg-white text-black font-bold' 
                    : 'bg-white/5 border border-white/10 text-white/90'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className={`text-[9px] mt-2 block ${msg.sender === 'user' ? 'text-black/40' : 'text-white/30'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-[1.5rem]">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 bg-white/[0.02] border-t border-white/5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Query system..."
                className="w-full pl-6 pr-14 py-4 bg-black border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-[#00E5FF]/40 transition-all placeholder:text-white/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="absolute right-3 w-10 h-10 bg-[#00E5FF] text-black rounded-xl flex items-center justify-center hover:bg-[#00D4EB] transition-all disabled:opacity-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;