-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for ProductEmbedding
-- This index will be created after the initial migration when the table exists
-- Run this after running `prisma migrate dev`
-- CREATE INDEX IF NOT EXISTS product_embedding_hnsw_idx
-- ON "ProductEmbedding"
-- USING hnsw (vector vector_cosine_ops);

-- Create HNSW index for TasteProfile
-- CREATE INDEX IF NOT EXISTS taste_profile_hnsw_idx
-- ON "TasteProfile"
-- USING hnsw (vector vector_cosine_ops);
