import { useState } from 'react';

const APIDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('analyze');
  const [language, setLanguage] = useState('curl');

  const endpoints = [
    {
      id: 'analyze',
      name: 'Analyze URL',
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
      name: 'Analyze Email',
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
      name: 'Scan File',
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
      name: 'Get Report',
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-sans">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-white/10 bg-black p-5">
          <h3 className="text-white font-sans text-xs font-bold mb-4">API Endpoints</h3>
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint.id)}
                className={`w-full p-3 rounded-lg transition-colors duration-150 text-left
                  ${selectedEndpoint === endpoint.id
                    ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30'
                    : 'hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold border ${
                    endpoint.method === 'GET' ? 'border-[#2DD4BF]/30 text-[#2DD4BF]' :
                    'border-[#00E5FF]/30 text-[#00E5FF]'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-white text-xs font-sans font-semibold">{endpoint.name}</span>
                </div>
                <code className="text-white/40 text-[9px] block truncate">
                  {endpoint.path}
                </code>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <h4 className="text-white font-sans text-[10px] font-bold mb-2">Authentication</h4>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-white/40 text-[9px] mb-1">All API requests require an API key:</p>
              <code className="text-[#00E5FF] text-[9px] font-mono break-all">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="lg:col-span-2 space-y-5">
        {/* Endpoint Details */}
        <div className="rounded-xl border border-white/10 bg-black p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded text-[10px] font-sans font-bold border ${
              selectedEndpointData.method === 'GET' ? 'border-[#2DD4BF]/30 text-[#2DD4BF]' :
              'border-[#00E5FF]/30 text-[#00E5FF]'
            }`}>
              {selectedEndpointData.method}
            </span>
            <code className="text-white text-xs font-mono">{selectedEndpointData.path}</code>
          </div>
          
          <p className="text-white/60 text-sm mb-5">{selectedEndpointData.description}</p>

          {/* Parameters */}
          <div className="mb-5">
            <h4 className="text-white font-sans text-[11px] font-bold mb-3">Parameters</h4>
            <div className="rounded-lg border border-white/10 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Parameter</th>
                    <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Type</th>
                    <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Required</th>
                    <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEndpointData.parameters.map((param, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-2 px-3"><code className="text-[#00E5FF] text-xs">{param.name}</code></td>
                      <td className="py-2 px-3 text-white/60 text-xs">{param.type}</td>
                      <td className="py-2 px-3">{param.required ? <span className="text-[#00E5FF] text-xs">YES</span> : <span className="text-white/40 text-xs">NO</span>}</td>
                      <td className="py-2 px-3 text-white/60 text-xs">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responses */}
          <div className="mb-5">
            <h4 className="text-white font-sans text-[11px] font-bold mb-3">Responses</h4>
            <div className="space-y-2">
              {selectedEndpointData.responses.map((response, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-white/10 bg-white/5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                    response.code === 200 ? 'border-[#2DD4BF]/30 text-[#2DD4BF]' :
                    response.code >= 400 ? 'border-red-500/30 text-red-500' :
                    'border-[#00E5FF]/30 text-[#00E5FF]'
                  }`}>
                    {response.code}
                  </span>
                  <span className="text-white/60 text-xs">{response.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="rounded-xl border border-white/10 bg-black p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-sans text-[11px] font-bold">Code Examples</h4>
            <div className="flex gap-1">
              {['curl', 'python', 'javascript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-sans font-semibold transition-colors duration-150
                    ${language === lang
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                      : 'text-white/40 hover:text-white'
                    }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 p-4 overflow-x-auto">
            <pre className="text-white/70 text-xs font-mono whitespace-pre-wrap">
              {codeExamples[language]?.[selectedEndpoint] || codeExamples.curl.analyze}
            </pre>
          </div>

          <div className="mt-3 flex gap-3">
            <button className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-sans font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Code
            </button>
            <button className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-sans font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Try It Now
            </button>
          </div>
        </div>

        {/* Rate Limits Info */}
        <div className="rounded-xl border border-white/10 bg-black p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5">
              <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-sans text-xs font-bold mb-1">Rate Limits</h4>
              <p className="text-white/50 text-xs">
                Free: <span className="text-white">1,000 requests/hour</span> • 
                Pro: <span className="text-white">10,000 requests/hour</span> • 
                Enterprise: <span className="text-white">Custom limits</span>
              </p>
              <p className="text-white/30 text-[10px] mt-1">
                Rate limit headers are included in all API responses. Upgrade your plan for higher limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;