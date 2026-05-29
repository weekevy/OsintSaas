import { useState } from 'react';

const APIDocumentation = () => {
  const [activeLang, setActiveTab] = useState('curl');

  const codeSnippets = {
    curl: `curl -X POST http://localhost:4000/api/v1/analyze/url \\
  -H "X-API-Key: osint_3ca62c5392614494a7b78e03c24ece04de9f20e40b0e45e49934078a57e8e17b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "example.com"
  }'`,
    python: `import requests

url = "http://localhost:4000/api/v1/analyze/url"
headers = {
    "X-API-Key": "osint_3ca62c5392614494a7b78e03c24ece04de9f20e40b0e45e49934078a57e8e17b",
    "Content-Type": "application/json"
}
data = {
    "target": "example.com"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
    javascript: `const axios = require('axios');

async function analyzeTarget() {
  try {
    const response = await axios.post('http://localhost:4000/api/v1/analyze/url', {
      target: 'example.com'
    }, {
      headers: {
        'X-API-Key': 'osint_3ca62c5392614494a7b78e03c24ece04de9f20e40b0e45e49934078a57e8e17b'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

analyzeTarget();`
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
        <h3 className="text-white font-bold text-base uppercase tracking-tight">Integration Protocol</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Global Configuration</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-bold text-white/40 uppercase">Base URL</span>
                <code className="text-[#00E5FF] text-[10px] font-mono">http://localhost:4000/api/v1</code>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-bold text-white/40 uppercase">Auth Header</span>
                <code className="text-[#00E5FF] text-[10px] font-mono">X-API-Key</code>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Quick Start</h4>
            <p className="text-xs text-white/30 leading-relaxed">
              Programmatic access requires a valid <span className="text-white font-bold">Interface Node Token</span>. All requests must be transmitted over HTTPS with appropriate cryptographic headers. The system supports full-duplex communication for real-time reconnaissance streams.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/10 p-1">
            {['curl', 'python', 'javascript'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all duration-300 rounded-2xl ${activeLang === lang ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-white/20 hover:text-white/40'}`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="p-6 relative">
            <pre className="text-[10px] font-mono text-white/60 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
              {codeSnippets[activeLang]}
            </pre>
            <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-[#2DD4BF] uppercase tracking-tighter animate-pulse">
              <div className="w-1 h-1 rounded-full bg-current shadow-[0_0_5px_currentColor]" />
              Live Syntax
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;