const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const mysql = require('mysql2/promise');

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

console.log('[Worker] Central Orchestrator is online and listening for OSINT jobs...');
