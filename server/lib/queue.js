import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

export const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const scanQueue = new Queue('scan-queue', { connection });
export const scanQueueEvents = new QueueEvents('scan-queue', { connection });

/**
 * Adds a new scan job to the BullMQ queue.
 * @param {Object} data - The scan job data.
 * @param {number} data.scanId - The ID of the scan in the DB.
 * @param {string} data.target - The investigation target.
 * @param {number} data.userId - The ID of the user who initiated the scan.
 * @param {string} data.module - The module to use (e.g., 'job-recruitment').
 */
export const addScanToQueue = async (data) => {
  return await scanQueue.add('investigation-scan', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
