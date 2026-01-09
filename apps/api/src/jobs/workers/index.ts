import { Worker } from 'bullmq';
import { createCuratedCollectionsWorker } from './curatedCollections.worker.js';
import { createProductEmbeddingWorker } from './productEmbedding.worker.js';
import { createProductEnrichmentWorker } from './productEnrichment.worker.js';
import { createTasteProfileEmbeddingWorker } from './tasteProfileEmbedding.worker.js';
import { createReminderDispatchWorker } from './reminderDispatch.worker.js';

import { logger } from '../../utils/logger.js';

/**
 * Worker Registry
 *
 * Centralized management of all BullMQ workers.
 * Start and stop all workers together.
 */

export class WorkerRegistry {
  private workers: Worker[] = [];

  /**
   * Start all workers
   */
  start() {
    logger.info('Starting all workers...');

    // Start curated collections worker
    const curatedCollectionsWorker = createCuratedCollectionsWorker();
    this.workers.push(curatedCollectionsWorker);

    // Start product embedding worker
    const productEmbeddingWorker = createProductEmbeddingWorker();
    this.workers.push(productEmbeddingWorker);

    // Start product enrichment worker
    const productEnrichmentWorker = createProductEnrichmentWorker();
    this.workers.push(productEnrichmentWorker);

    // Start taste profile embedding worker
    const tasteProfileEmbeddingWorker = createTasteProfileEmbeddingWorker();
    this.workers.push(tasteProfileEmbeddingWorker);

    // Start reminder dispatch worker
    const reminderDispatchWorker = createReminderDispatchWorker();
    this.workers.push(reminderDispatchWorker);

    logger.info(
      { workerCount: this.workers.length },
      'All workers started successfully'
    );
  }

  /**
   * Stop all workers gracefully
   */
  async stop() {
    logger.info('Stopping all workers...');

    await Promise.all(this.workers.map((worker) => worker.close()));

    logger.info('All workers stopped');
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      workersCount: this.workers.length,
      workers: this.workers.map((worker) => ({
        name: worker.name,
        isRunning: worker.isRunning(),
      })),
    };
  }
}

export const workerRegistry = new WorkerRegistry();
