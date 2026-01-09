import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { logger } from '../utils/logger.js';

interface Point {
    id: string;
    vector: number[];
}

interface Cluster {
    centroid: number[];
    points: Point[];
    score?: number;
    diversityScore?: number;
    coherenceScore?: number;
}

export class ClusteringService {
    /**
     * Perform K-Means clustering on a set of items with embeddings.
     * optimized K-Means implementation for handling 2k-20k items.
     */
    async clusterItems(items: Point[], k: number, maxIterations = 20): Promise<Cluster[]> {
        if (items.length === 0) return [];
        if (items.length < k) k = items.length;

        // Initialize centroids (Simple random initialization)
        // For production, K-Means++ logic is better but this is sufficient for MVP
        let centroids = this.initializeCentroids(items, k);
        let clusters: Cluster[] = [];

        for (let i = 0; i < maxIterations; i++) {
            // Assignment step
            clusters = centroids.map((c) => ({ centroid: c, points: [] }));

            for (const item of items) {
                let minDist = Infinity;
                let closestIndex = 0;

                for (let j = 0; j < k; j++) {
                    const dist = this.cosineDistance(item.vector, centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        closestIndex = j;
                    }
                }
                clusters[closestIndex].points.push(item);
            }

            // Update step
            let converged = true;
            const newCentroids = clusters.map((cluster) => {
                if (cluster.points.length === 0) return cluster.centroid; // Keep old centroid if empty
                const newCentroid = this.calculateCentroid(cluster.points);

                // Check convergence (simple check: if centroid moved significantly)
                if (this.cosineDistance(cluster.centroid, newCentroid) > 0.001) {
                    converged = false;
                }
                return newCentroid;
            });

            centroids = newCentroids;
            if (converged) break;
        }

        return clusters.filter(c => c.points.length > 0); // Prune empty clusters
    }

    /**
     * Score clusters based on coherence, diversity, and coverage.
     */
    scoreClusters(clusters: Cluster[], minSize = 10): Cluster[] {
        return clusters.map(cluster => {
            // Coherence: Avg cosine similarity to centroid (higher is better)
            const coherence = cluster.points.reduce((sum, p) =>
                sum + (1 - this.cosineDistance(p.vector, cluster.centroid)), 0
            ) / cluster.points.length;

            // Coverage penalty: penalize very small clusters
            const sizePenalty = cluster.points.length < minSize ? 0.5 : 1.0;

            // Simple diversity proxy: variance of distances (optional, requires more compute)
            // For now, simple weighted score
            const score = (coherence * 0.7 + sizePenalty * 0.3);

            return {
                ...cluster,
                score,
                coherenceScore: coherence
            };
        }).sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    // --- Helpers ---

    private initializeCentroids(items: Point[], k: number): number[][] {
        // Randomly select k unique points
        const indices = new Set<number>();
        while (indices.size < k) {
            indices.add(Math.floor(Math.random() * items.length));
        }
        return Array.from(indices).map(i => [...items[i].vector]);
    }

    private calculateCentroid(points: Point[]): number[] {
        if (points.length === 0) return [];
        const dim = points[0].vector.length;
        const centroid = new Array(dim).fill(0);

        for (const point of points) {
            for (let i = 0; i < dim; i++) {
                centroid[i] += point.vector[i];
            }
        }

        // Average
        for (let i = 0; i < dim; i++) {
            centroid[i] /= points.length;
        }
        return centroid;
    }

    private cosineDistance(a: number[], b: number[]): number {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1); // Avoid div/0
        return 1 - similarity; // Distance
    }

    // New method: Fetch embeddings helper
    async fetchEmbeddingsForItems(ids: string[]): Promise<Point[]> {
        // In a real scenario, this would query the vector DB or Prisma
        // Assuming Prisma has a way to get raw vectors or we use a separate Vector Store client
        // For now, retrieving from Prisma `Embedding` table if we store vectors there.

        // Note: Prisma 'vector' type support varies. Typically need raw SQL query for vectors.
        // This is a placeholder for the raw query logic.
        const result = await prisma.$queryRaw`
        SELECT "entityId" as id, vector::text as vector
        FROM "Embedding"
        WHERE "entityId" IN (${Prisma.join(ids)})
        AND kind = 'SEMANTIC'::"EmbeddingKind" 
    `;

        // Parse vector string "[0.1, 0.2, ...]" to number[]
        // @ts-ignore
        return result.map((row: any) => ({
            id: row.id,
            vector: JSON.parse(row.vector)
        }));
    }
}

export const clusteringService = new ClusteringService();
