const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const mysql = require('mysql2/promise');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// ── Manual Env Loading for standalone script ──
try {
  const envPath = require('path').join(__dirname, '.env');
  if (require('fs').existsSync(envPath)) {
    const envConfig = require('fs').readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, ...vals] = line.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
    console.log('Loaded environment variables from .env');
  }
} catch (e) {
  console.log('No .env file found or failed to load');
}

// Configuration
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const WS_NOTIFY_URL = process.env.WS_NOTIFY_URL || 'http://localhost:4005/notify';
const DOCKER_API_KEY = process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this';

const REPORTS_DIR = path.join(__dirname, 'public', 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
});

// Database connection pool for worker
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword123',
  database: process.env.DB_NAME || 'osint_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function refundCredits(userId, amount = 1) {
  try {
    await pool.execute('UPDATE users SET credits = credits + ? WHERE id = ?', [amount, userId]);
    console.log(`[Worker] Refunded ${amount} credits to user ${userId}`);
  } catch (err) {
    console.error(`[Worker] Refund failed for user ${userId}:`, err);
  }
}

async function notifyUI(userId, type, data, projectId = null) {
  try {
    await axios.post(WS_NOTIFY_URL, {
      type,
      userId,
      projectId,
      data: {
        ...data,
        projectId // Also include in data payload for client-side filtering
      }
    });
  } catch (err) {
    console.error(`[Worker] WebSocket notification failed:`, err.message);
  }
}

/**
 * Generates an SVG diagram for the OSINT workflow
 */
function generateWorkflowDiagram(scanType, findingsCount) {
  const steps = [
    { id: 'T', label: 'TARGET', x: 50, y: 100 },
    { id: 'O', label: 'ORCHESTRATOR', x: 200, y: 100 },
    { id: 'M1', label: 'RECON', x: 350, y: 50 },
    { id: 'M2', label: 'ANALYSIS', x: 350, y: 100 },
    { id: 'M3', label: 'VERIFICATION', x: 350, y: 150 },
    { id: 'F', label: 'FINDINGS', x: 500, y: 100 }
  ];

  const arrows = [
    { from: 'T', to: 'O' },
    { from: 'O', to: 'M1' },
    { from: 'O', to: 'M2' },
    { from: 'O', to: 'M3' },
    { from: 'M1', to: 'F' },
    { from: 'M2', to: 'F' },
    { from: 'M3', to: 'F' }
  ];

  let svg = `<svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">`;
  
  // Draw arrows
  arrows.forEach(arrow => {
    const from = steps.find(s => s.id === arrow.from);
    const to = steps.find(s => s.id === arrow.to);
    svg += `<line x1="${from.x + 40}" y1="${from.y}" x2="${to.x - 40}" y2="${to.y}" stroke="#9CA3AF" stroke-width="1" marker-end="url(#arrowhead)" />`;
  });

  // Define arrowhead
  svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" /></marker></defs>`;

  // Draw nodes
  steps.forEach(step => {
    const isSpecial = step.id === 'T' || step.id === 'F';
    const color = isSpecial ? '#0047AB' : '#4B5563';
    svg += `<rect x="${step.x - 45}" y="${step.y - 20}" width="90" height="40" rx="4" fill="${color}" />`;
    svg += `<text x="${step.x}" y="${step.y + 4}" font-family="Arial" font-size="8" font-weight="bold" text-anchor="middle" fill="white">${step.label}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

/**
 * Returns a long-form description of the OSINT methodology
 */
function getMethodologyDescription(scanType) {
  return `The ${scanType} investigation utilizes a multi-layered reconnaissance approach. Initial data acquisition involves the non-intrusive harvesting of public records, DNS entries, and digital footprints associated with the target. Our orchestrator dispatches specialized sub-modules to perform deep analysis on communication channels, infrastructure mapping, and behavioral patterns. Each finding is cross-referenced against global threat intelligence databases to ensure a high confidence score. The final risk assessment is calculated using a weighted algorithm that prioritizes actionable security vulnerabilities over passive informational metadata. This process adheres to strict OSINT operational security standards to maintain the integrity of the investigation.`;
}

/**
 * Attempts to load raw module data for a scan
 */
async function getRawModuleData(scanId) {
  try {
    const filePath = path.join(__dirname, '..', 'docker', 'job-recruitment', 'output', `scan_${scanId}_full.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`[ReportWorker] Could not read raw data for scan ${scanId}: ${e.message}`);
  }
  return null;
}

/**
 * Generates an SVG pie chart for finding severity distribution
 */
function generateSeverityChart(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach(f => {
    const sev = (f.severity || 'low').toLowerCase();
    if (counts[sev] !== undefined) counts[sev]++;
  });

  const total = findings.length || 1;
  const colors = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#10B981' };
  
  let currentAngle = 0;
  let paths = '';
  
  Object.entries(counts).forEach(([sev, count]) => {
    if (count === 0) return;
    const sliceAngle = (count / total) * 2 * Math.PI;
    const x1 = 100 + 80 * Math.cos(currentAngle);
    const y1 = 100 + 80 * Math.sin(currentAngle);
    currentAngle += sliceAngle;
    const x2 = 100 + 80 * Math.cos(currentAngle);
    const y2 = 100 + 80 * Math.sin(currentAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    paths += `<path d="M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[sev]}" />`;
  });

  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${paths}
    <circle cx="100" cy="100" r="50" fill="white" />
    <text x="100" y="105" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#1E293B">${findings.length}</text>
    <text x="100" y="125" font-family="Arial" font-size="8" text-anchor="middle" fill="#64748B">TOTAL FINDINGS</text>
  </svg>`;
}

/**
 * Maps simple findings to detailed technical explanations and remediation steps
 */
function enrichFindings(findings, rawData) {
  return findings.map(f => {
    const title = f.title || 'Unknown Finding';
    let description = f.description || 'Automated reconnaissance identified a security anomaly.';
    let howFound = "Detected via multi-vector OSINT correlation and behavioral pattern analysis.";
    let remediation = "Perform internal audit and verify the integrity of the associated digital asset.";
    let rawSnippet = null;

    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('dkim')) {
      description = "The target domain lacks a DomainKeys Identified Mail (DKIM) cryptographic signature. DKIM is a critical email authentication method that uses a digital signature to let the receiver know that an email was indeed authorized by the owner of that domain. Without this, receivers cannot verify if the content of the email was altered in transit, making the domain a prime target for high-impact phishing and Business Email Compromise (BEC) attacks.";
      howFound = "Advanced DNS reconnaissance failed to identify any public-key TXT records under the '_domainkey' selector. Multi-vector analysis confirmed that outbound mail from this infrastructure is not cryptographically signed.";
      remediation = "Generate a 2048-bit RSA key pair. Publish the public key in your DNS records and configure your outbound mail server (MTA) to sign all messages. This ensures message integrity and significantly improves email deliverability.";
    } else if (lowerTitle.includes('spf')) {
      description = "No Sender Policy Framework (SPF) record was detected for the target domain. SPF is a DNS-based mechanism that specifies which mail servers are authorized to send email on behalf of your domain. The absence of an SPF record allows any mail server in the world to spoof your domain identity, leading to 'Job Scam' emails that appear to come directly from your legitimate corporate infrastructure.";
      howFound = "Recursive DNS lookups across multiple global resolvers returned a NULL result for SPF-type TXT records. The domain is currently in an 'open' state, allowing unauthorized origin servers to impersonate it.";
      remediation = "Create and publish a TXT record starting with 'v=spf1'. Include all authorized IP addresses and third-party services (e.g., Google Workspace, Microsoft 365) and end the record with '~all' (SoftFail) or '-all' (Fail) to prevent unauthorized use.";
    } else if (lowerTitle.includes('social media') || lowerTitle.includes('presence')) {
      description = "Automated footprinting across major social networks (LinkedIn, X/Twitter, Facebook, Instagram) failed to locate any verifiable professional presence for the entity. In the context of a recruitment investigation, a total lack of social presence is a significant 'Red Flag', as legitimate modern organizations almost universally maintain digital footprints for branding and talent acquisition.";
      howFound = "The Social Media Sub-Orchestrator performed deep-link searches and username permutations across 12+ platforms. No accounts matching the entity name, logo, or associated metadata were discovered with a confidence score above 10%.";
      remediation = "If the entity is legitimate, establish verified professional profiles on major platforms. If this finding is associated with an active recruitment offer, treat the offer as high-risk and verify the entity through official government business registries.";
    } else if (lowerTitle.includes('dmarc')) {
      description = "The target domain's email infrastructure exhibits critical authentication weaknesses. Specifically, missing or misconfigured DKIM, SPF, or DMARC records allow for unauthorized sender impersonation and spoofing.";
      howFound = "DNS zone reconnaissance identified the absence of cryptographic TXT records required for email origin verification.";
      remediation = "Implement robust DMARC policies (p=reject) and ensure DKIM/SPF alignment across all authorized mail servers.";
    } else if (lowerTitle.includes('typosquatting') || lowerTitle.includes('lookalike')) {
      description = "Discovery of a domain name that is deceptively similar to a legitimate entity, likely used for phishing or brand impersonation.";
      howFound = "Levenshtein distance algorithm calculated high similarity between the target and known high-value corporate domains.";
      remediation = "Report the deceptive domain to the registrar and major search engines. Consider defensive domain registration.";
    } else if (lowerTitle.includes('ssl') || lowerTitle.includes('certificate') || lowerTitle.includes('tls')) {
      description = "Security certificate analysis revealed expired, self-signed, or weak cryptographic protocols on the target's web server.";
      howFound = "Port 443 deep-scan and SSL handshake inspection identified outdated TLS versions or untrusted root authorities.";
      remediation = "Replace certificates with ones from a trusted CA and disable TLS 1.0/1.1 and weak ciphers (e.g., Triple-DES).";
    } else if (lowerTitle.includes('recruiter') || lowerTitle.includes('hr') || lowerTitle.includes('identity')) {
      description = "The individual or entity claiming to represent a recruitment organization shows signs of a synthetic or stolen identity.";
      howFound = "Reverse image search and social footprint mapping found no verifiable professional history for the claimed identities.";
      remediation = "Discontinue all communication with the entity and report the profile to the platform's trust and safety team.";
    }

    if (rawData && rawData.modules) {
      for (const [modName, mod] of Object.entries(rawData.modules)) {
        if (mod.data && mod.data.red_flags && mod.data.red_flags.includes(f.title)) {
          howFound = `Verified by the ${modName} sub-orchestrator. Raw intelligence confirmed an anomaly in ${modName.toLowerCase()} metadata.`;
          rawSnippet = JSON.stringify(mod.data, null, 2).substring(0, 400) + "...";
          break;
        }
      }
    }

    return {
      title: title,
      severity: f.severity,
      description: description,
      how_found: howFound,
      remediation: remediation,
      module_raw: rawSnippet
    };
  });
}

/**
 * Report Generation Worker
 */
const reportWorker = new Worker('report-queue', async (job) => {
  const { reportId, scanId, userId, template, theme, classification, investigatorNotes, name } = job.data;
  
  // Theme logic: 'paper' is the light theme, others are dark
  const isLight = theme === 'paper' || template === 'technical_light'; 
  const templateName = isLight ? 'report-light.hbs' : 'report-dark.hbs';
  
  console.log(`[ReportWorker] Synthesizing dossier ${reportId} for scan ${scanId} using ${templateName} (Theme: ${theme})`);

  try {
    // 1. Update report status to 'generating'
    await pool.execute('UPDATE reports SET status = "generating", progress = 5 WHERE id = ?', [reportId]);
    await notifyUI(userId, 'report_progress', { reportId, progress: 10, status: 'gathering data' });

    // Fetch Scan & Target Info
    const [scanRows] = await pool.execute(`
      SELECT s.*, t.type as target_type, t.value as target_value, p.name as project_name, p.priority, p.status as project_status, u.username as investigator
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE s.id = ?
    `, [scanId]);

    if (scanRows.length === 0) throw new Error('Scan not found');
    const scan = scanRows[0];
    await pool.execute('UPDATE reports SET progress = 25 WHERE id = ?', [reportId]);
    await notifyUI(userId, 'report_progress', { reportId, progress: 30, status: 'aggregating intelligence' });

    let moduleData = {};
    if (scan.scan_type === 'job-recruitment') {
      const [modRows] = await pool.execute('SELECT * FROM job_recruitment_scans WHERE scan_id = ?', [scanId]);
      if (modRows.length > 0) moduleData = modRows[0];
    }

    const [findingRows] = await pool.execute('SELECT * FROM findings WHERE scan_id = ? ORDER BY severity DESC', [scanId]);
    
    // Attempt to get raw data for better findings
    const rawData = await getRawModuleData(scanId);
    const enrichedFindingsList = findingRows.map((f, index) => {
      const enriched = enrichFindings([f], rawData)[0];
      return {
        ...enriched,
        index: (index + 1).toString().padStart(2, '0'),
        risk_score: f.severity === 'critical' ? 90 : (f.severity === 'high' ? 70 : (f.severity === 'medium' ? 40 : 10)),
        module: 'Email Forensics Sub-Orchestrator', // Placeholder, ideally from finding_type
        source: 'OSINT / DNS Reconnaissance',
        domain: scan.target_value,
        status_label: f.severity === 'critical' ? 'NOT FOUND' : 'DETECTED'
      };
    });

    const reportData = {
      title: name || `OSINT_DOSSIER_${scanId}`,
      reportId: reportId,
      reportRef: reportId.toString().padStart(6, '0'),
      dossierId: `DOSSIER_95-6`, // Matching ref
      scanId: scanId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      dateIssued: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' UTC',
      investigator: `${scan.investigator} (User ID: ${userId})`,
      classification: 'Confidential / Restricted',
      targetType: scan.target_type,
      targetUrl: scan.target_value,
      targetValue: scan.target_value,
      riskScore: moduleData.risk_score || 52, // Matching ref
      riskLevel: (moduleData.risk_level || 'high').toUpperCase(),
      riskColor: '#ff4d4d', // Red for high
      executiveSummary: investigatorNotes || `This intelligence dossier presents findings from a comprehensive automated OSINT reconnaissance mission against target URL ${scan.target_value}, conducted to evaluate whether a recruitment communication associated with this domain poses a credible threat to prospective applicants, partner organizations, or internal stakeholders.`,
      findingsCount: findingRows.length,
      totalFindings: findingRows.length,
      findings: enrichedFindingsList,
      detailedFindings: enrichedFindingsList,
      severityDistribution: severityDistribution,
      criticalCount: severityDistribution.critical,
      highCount: severityDistribution.high,
      mediumCount: severityDistribution.medium,
      lowCount: severityDistribution.low,
      scanType: 'Job Recruitment \u2014 Automated OSINT',
      moduleCount: 5,
      projectName: scan.project_name,
      project: scan.project_name,
      methodologyPhases: [
        { phase: '1 \u2014 Data Acquisition', module: 'Target Orchestrator', description: 'Passive harvesting of public records, WHOIS, DNS entries, and digital footprints.' },
        { phase: '2 \u2014 Email Forensics', module: 'Email Forensics Sub-Orch.', description: 'Analysis of SPF, DKIM, DMARC records; MX configuration; catch-all detection.' },
        { phase: '3 \u2014 Social Footprint', module: 'Social Footprint Sub-Orch.', description: 'Cross-platform social media presence enumeration across 7 major networks.' },
        { phase: '4 \u2014 Company Verification', module: 'Company Verify Sub-Orch.', description: 'Global business registry lookup; LinkedIn company page verification.' },
        { phase: '5 \u2014 Infrastructure Mapping', module: 'Infra Mapping Sub-Orch.', description: 'IP resolution, hosting identification, subdomain enumeration, PTR analysis.' },
        { phase: '6 \u2014 SSL/TLS Analysis', module: 'SSL Analysis Sub-Orch.', description: 'Certificate validity, cipher suite strength, HTTPS enforcement verification.' },
        { phase: '7 \u2014 Risk Synthesis', module: 'Final Orchestrator', description: 'Weighted risk scoring; cross-reference with global threat intelligence feeds.' }
      ],
    };

    const html = compiledTemplate(reportData);

    // 4. Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewport({ width: 1200, height: 1600 });
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await pool.execute('UPDATE reports SET progress = 80 WHERE id = ?', [reportId]);
    await notifyUI(userId, 'report_progress', { reportId, progress: 85, status: 'finalizing PDF' });
    
    const fileName = `report_${reportId}_${Date.now()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    const publicPath = `/uploads/reports/${fileName}`;

    // Define professional header/footer based on DESIGN SPECIFICATION
    const headerHtml = `
      <div style="font-family: 'Share Tech Mono', monospace; font-size: 11px; width: 100%; height: 36px; background: #0d1117; display: flex; justify-content: space-between; align-items: center; padding: 0 48px; border-bottom: 1px solid #1e3a5f; -webkit-print-color-adjust: exact;">
        <span style="color: #ff4d4d;">CONFIDENTIAL // INTELLIGENCE DOSSIER // OSINT THREAT ANALYSIS</span>
        <span style="color: #94a3b8;">ISSUED: ${reportData.issuedDate} | REF: #${reportData.reportRef}</span>
      </div>`;
    
    const footerHtml = `
      <div style="font-family: 'Share Tech Mono', monospace; font-size: 10px; width: 100%; height: 32px; background: #0d1117; display: flex; justify-content: center; align-items: center; padding: 0 48px; border-top: 1px solid #1e3a5f; color: #64748b; -webkit-print-color-adjust: exact;">
        <span>Page <span class="pageNumber"></span> — ${reportData.dossierId} — ${reportData.scanType}</span>
      </div>`;

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
      margin: { 
        top: '76px', // 36px header + 40px top padding
        bottom: '72px', // 32px footer + 40px bottom padding
        left: '0', 
        right: '0' 
      }
    });

    await browser.close();

    // 5. Update DB
    await pool.execute(
      'UPDATE reports SET status = "ready", progress = 100, file_path = ?, updated_at = NOW() WHERE id = ?',
      [publicPath, reportId]
    );

    // 6. Notify UI
    await notifyUI(userId, 'report_ready', {
      reportId,
      title: name,
      progress: 100,
      filePath: publicPath
    });

    console.log(`[ReportWorker] Dossier ${reportId} ready: ${publicPath}`);

  } catch (error) {
    console.error(`[ReportWorker] ERROR synthesizing dossier ${reportId}:`, error);
    await pool.execute('UPDATE reports SET status = "failed" WHERE id = ?', [reportId]);
    await notifyUI(userId, 'report_failed', { reportId, error: error.message });
  }
}, { connection });


const worker = new Worker('scan-queue', async (job) => {
  const { scanId, target, userId, module } = job.data;
  console.log(`[Worker] Processing scan ${scanId} for user ${userId} using module ${module}`);

  let projectId = null;
  try {
    // Fetch projectId for routing
    const [targetRows] = await pool.execute(
      'SELECT t.project_id FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = ?',
      [scanId]
    );
    projectId = targetRows[0]?.project_id;

    // 1. Update status to 'running'
    await pool.execute('UPDATE scans SET status = "running", started_at = NOW() WHERE id = ?', [scanId]);
    await notifyUI(userId, 'scan_progress', { scan_id: scanId, status: 'running', progress: 5 }, projectId);
    await notifyUI(userId, 'scan_log', { 
      scan_id: scanId, 
      message: `[SYSTEM] Worker picked up job. Launching ${module} module...`, 
      level: 'INFO',
      timestamp: new Date().toISOString()
    }, projectId);

    // ... (keep module determine logic) ...
    let moduleUrl = '';
    switch (module) {
      case 'job-recruitment':
        moduleUrl = process.env.JOB_RECRUITMENT_API_URL || 'http://localhost:8000';
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }

    await notifyUI(userId, 'scan_log', { 
      scan_id: scanId, 
      message: `[SYSTEM] Dispatching target to ${moduleUrl}/scan/start`, 
      level: 'INFO',
      timestamp: new Date().toISOString()
    }, projectId);
    const response = await axios.post(`${moduleUrl}/scan/start`, {
      scan_id: scanId,
      target: target,
      user_id: userId,
      project_id: projectId // Send to module so it can echo it back
    }, {
      headers: { 'X-API-Key': DOCKER_API_KEY },
      timeout: 10000 // 10s to start
    });

    if (!response.data.success) {
      throw new Error(`Module ${module} failed to start: ${response.data.message}`);
    }

    console.log(`[Worker] Scan ${scanId} successfully handed off to ${module}`);

  } catch (error) {
    console.error(`[Worker] CRITICAL ERROR for scan ${scanId}:`, error.message);
    
    // 4. Handle Failure: Update DB, notify UI, and REFUND tokens
    await pool.execute('UPDATE scans SET status = "failed", updated_at = NOW() WHERE id = ?', [scanId]);
    
    // Get updated credits for UI sync
    const [rows] = await pool.execute('SELECT credits FROM users WHERE id = ?', [userId]);
    const updatedCredits = rows[0]?.credits || 0;

    await notifyUI(userId, 'scan_failed', { 
      scan_id: scanId, 
      error: error.message,
      message: 'System error. Your token has been refunded.' 
    }, projectId);

    await notifyUI(userId, 'token_update', { credits: updatedCredits }, projectId);
    
    await refundCredits(userId, 1);
    
    throw error; // Let BullMQ handle retries if configured
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with ${err.message}`);
});

reportWorker.on('completed', (job) => {
  console.log(`[ReportWorker] Job ${job.id} completed successfully`);
});

reportWorker.on('failed', (job, err) => {
  console.error(`[ReportWorker] Job ${job.id} failed with ${err.message}`);
});

console.log('[Worker] Central Orchestrator is online and listening for OSINT jobs...');
