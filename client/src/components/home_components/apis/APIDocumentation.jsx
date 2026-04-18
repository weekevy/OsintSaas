import { useState } from 'react';

const APIDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('analyze');
  const [language, setLanguage] = useState('curl');

  const endpoints = [
    {
      id: 'analyze',
      name: 'ANALYZE URL',
      method: 'POST',
      path: '/api/v1/analyze/url',
      description: 'Submit a URL for threat analysis',
      parameters: [
        { name: 'url', type: 'string', required: true, description: 'The URL to analyze' },
        { name: 'options', type: 'object', required: false, description: 'Analysis options' },
        { name: 'callback', type: 'string', required: false, description: 'Webhook callback URL' }
      ],
      responses: [
        { code: 200, description: 'Analysis completed successfully' },
        { code: 202, description: 'Analysis accepted (async)' },
        { code: 400, description: 'Invalid request parameters' },
        { code: 429, description: 'Rate limit exceeded' }
      ]
    },
    {
      id: 'email',
      name: 'ANALYZE EMAIL',
      method: 'POST',
      path: '/api/v1/analyze/email',
      description: 'Analyze email address for threats and breaches',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'Email address to analyze' },
        { name: 'deep_scan', type: 'boolean', required: false, description: 'Perform deep scan' }
      ],
      responses: [
        { code: 200, description: 'Analysis completed successfully' },
        { code: 400, description: 'Invalid email format' },
        { code: 429, description: 'Rate limit exceeded' }
      ]
    },
    {
      id: 'file',
      name: 'SCAN FILE',
      method: 'POST',
      path: '/api/v1/analyze/file',
      description: 'Upload and scan a file for malware',
      parameters: [
        { name: 'file', type: 'file', required: true, description: 'File to analyze' },
        { name: 'deep_scan', type: 'boolean', required: false, description: 'Perform deep scan' }
      ],
      responses: [
        { code: 200, description: 'Analysis completed successfully' },
        { code: 202, description: 'Analysis accepted (async)' },
        { code: 413, description: 'File too large' }
      ]
    },
    {
      id: 'report',
      name: 'GET REPORT',
      method: 'GET',
      path: '/api/v1/reports/{id}',
      description: 'Retrieve analysis report by ID',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Report ID' }
      ],
      responses: [
        { code: 200, description: 'Report retrieved successfully' },
        { code: 404, description: 'Report not found' }
      ]
    }
  ];

  const codeExamples = {
    curl: {
      analyze: `curl -X POST https://api.osintweekeyv.com/v1/analyze/url \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://suspicious-site.com",
    "options": {
      "deep_scan": true,
      "include_screenshot": false
    }
  }'`,
      email: `curl -X POST https://api.osintweekeyv.com/v1/analyze/email \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "suspicious@example.com",
    "deep_scan": true
  }'`,
      file: `curl -X POST https://api.osintweekeyv.com/v1/analyze/file \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/suspicious.pdf" \\
  -F "deep_scan=true"`,
      report: `curl -X GET https://api.osintweekeyv.com/v1/reports/abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    python: {
      analyze: `import requests

url = "https://api.osintweekeyv.com/v1/analyze/url"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "url": "https://suspicious-site.com",
    "options": {
        "deep_scan": True,
        "include_screenshot": False
    }
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
      email: `import requests

url = "https://api.osintweekeyv.com/v1/analyze/email"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "email": "suspicious@example.com",
    "deep_scan": True
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
      file: `import requests

url = "https://api.osintweekeyv.com/v1/analyze/file"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
files = {"file": open("/path/to/suspicious.pdf", "rb")}
data = {"deep_scan": "true"}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`,
      report: `import requests

url = "https://api.osintweekeyv.com/v1/reports/abc123"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json())`
    },
    javascript: {
      analyze: `fetch('https://api.osintweekeyv.com/v1/analyze/url', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://suspicious-site.com',
    options: {
      deep_scan: true,
      include_screenshot: false
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
      email: `fetch('https://api.osintweekeyv.com/v1/analyze/email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'suspicious@example.com',
    deep_scan: true
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
      file: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('deep_scan', 'true');

fetch('https://api.osintweekeyv.com/v1/analyze/file', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));`,
      report: `fetch('https://api.osintweekeyv.com/v1/reports/abc123', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data));`
    }
  };

  const selectedEndpointData = endpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-[#090c0e] border border-white/10 p-5 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          
          <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4">API ENDPOINTS</h3>
          <div className="space-y-1.5">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint.id)}
                className={`w-full p-2 transition-all text-left border
                  ${selectedEndpoint === endpoint.id
                    ? 'border-[#00ff88] bg-[#00ff88]/5'
                    : 'border-transparent hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[6px] font-mono border ${
                    endpoint.method === 'GET' ? 'border-[#34d399]/30 text-[#34d399]' :
                    endpoint.method === 'POST' ? 'border-[#00ff88]/30 text-[#00ff88]' :
                    'border-[#fbbf24]/30 text-[#fbbf24]'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-white text-[8px] font-mono uppercase tracking-[0.08em]">{endpoint.name}</span>
                </div>
                <code className="text-white/30 text-[6px] font-mono block mt-0.5 truncate">
                  {endpoint.path}
                </code>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <h4 className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-2">AUTHENTICATION</h4>
            <div className="bg-[#0d1114] border border-white/10 p-3">
              <p className="text-white/40 text-[7px] font-mono mb-1 uppercase tracking-[0.08em]">ALL API REQUESTS REQUIRE AN API KEY:</p>
              <code className="text-[#00ff88] text-[7px] font-mono break-all">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="lg:col-span-2 space-y-5">
        {/* Endpoint Details */}
        <div className="bg-[#090c0e] border border-white/10 p-5 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 text-[8px] font-mono border ${
              selectedEndpointData.method === 'GET' ? 'border-[#34d399]/30 text-[#34d399]' :
              selectedEndpointData.method === 'POST' ? 'border-[#00ff88]/30 text-[#00ff88]' :
              'border-[#fbbf24]/30 text-[#fbbf24]'
            }`}>
              {selectedEndpointData.method}
            </span>
            <code className="text-white font-mono text-[10px]">{selectedEndpointData.path}</code>
          </div>
          
          <p className="text-white/60 text-[8px] font-mono mb-4">{selectedEndpointData.description}</p>

          {/* Parameters */}
          <div className="mb-4">
            <h4 className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-2">PARAMETERS</h4>
            <div className="bg-[#0d1114] border border-white/10 overflow-x-auto">
              <table className="w-full text-[7px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">PARAMETER</th>
                    <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">TYPE</th>
                    <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">REQUIRED</th>
                    <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEndpointData.parameters.map((param, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-2 px-2"><code className="text-[#00ff88]">{param.name}</code></td>
                      <td className="py-2 px-2 text-white/50">{param.type}</td>
                      <td className="py-2 px-2">{param.required ? <span className="text-[#f87171]">YES</span> : <span className="text-white/30">NO</span>}</td>
                      <td className="py-2 px-2 text-white/50">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responses */}
          <div className="mb-4">
            <h4 className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-2">RESPONSES</h4>
            <div className="space-y-1.5">
              {selectedEndpointData.responses.map((response, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[#0d1114] border border-white/10">
                  <span className={`px-1.5 py-0.5 text-[7px] font-mono border ${
                    response.code === 200 ? 'border-[#34d399]/30 text-[#34d399]' :
                    response.code === 202 ? 'border-[#00ff88]/30 text-[#00ff88]' :
                    response.code >= 400 ? 'border-[#f87171]/30 text-[#f87171]' :
                    'border-[#fbbf24]/30 text-[#fbbf24]'
                  }`}>
                    {response.code}
                  </span>
                  <span className="text-white/50 text-[7px] font-mono">{response.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-[#090c0e] border border-white/10 p-5 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-mono text-[9px] font-bold uppercase tracking-[0.12em]">CODE EXAMPLES</h4>
            <div className="flex gap-1">
              {['curl', 'python', 'javascript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-[7px] font-mono uppercase tracking-[0.08em] transition-all border
                    ${language === lang
                      ? 'border-[#00ff88] text-[#00ff88]'
                      : 'border-white/10 text-white/40 hover:text-white'
                    }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1114] border border-white/10 p-3 overflow-x-auto">
            <pre className="text-white/60 text-[7px] font-mono whitespace-pre-wrap">
              {codeExamples[language]?.[selectedEndpoint] || codeExamples.curl.analyze}
            </pre>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button className="text-[#00ff88] hover:text-[#22d3ee] text-[7px] font-mono uppercase tracking-[0.08em] flex items-center gap-1 transition-colors">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              COPY CODE
            </button>
            <button className="text-[#00ff88] hover:text-[#22d3ee] text-[7px] font-mono uppercase tracking-[0.08em] flex items-center gap-1 transition-colors">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              TRY IT NOW
            </button>
          </div>
        </div>

        {/* Rate Limits Info */}
        <div className="bg-[#090c0e] border border-white/10 p-4 relative">
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00ff88]/30" />
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 border border-[#fbbf24]/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-1">RATE LIMITS</h4>
              <p className="text-white/50 text-[7px] font-mono uppercase tracking-[0.08em]">
                FREE TIER: <span className="text-white">1,000 REQUESTS/HOUR</span> • 
                PRO TIER: <span className="text-white">10,000 REQUESTS/HOUR</span> • 
                ENTERPRISE: <span className="text-white">CUSTOM LIMITS</span>
              </p>
              <p className="text-white/30 text-[6px] font-mono uppercase tracking-[0.08em] mt-1">
                RATE LIMIT HEADERS ARE INCLUDED IN ALL API RESPONSES. UPGRADE YOUR PLAN FOR HIGHER LIMITS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;