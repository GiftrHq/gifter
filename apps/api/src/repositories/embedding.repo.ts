import { prisma } from '../services/prisma.js';
import { EmbeddingEntityType, EmbeddingKind } from '@prisma/client';

export class EmbeddingRepository {
  async upsertEmbedding(data: {
    entityType: EmbeddingEntityType;
    entityId: string;
    kind: EmbeddingKind;
    provider: string;
    model: string;
    dims: number;
    vector: string; // serialized vector
    textHash?: string;
  }) {
    // Note: raw SQL is often needed for vector upserts depending on pgvector setup, 
    // but Prisma supports create/update with Unsupported types if mapped correctly or using raw queries.
    // For simplicity with standard Prisma client we might need raw query for the vector data 
    // or rely on a specific typed extension. 
    // Here we will use prisma.embedding.upsert if the vector type is handled, 
    // otherwise we might default to executeRaw.
    // Given the schema uses `Unsupported("vector(1536)")`, purely using the Client for the vector field is tricky without specific extensions.
    // We will use $executeRaw for insertion to ensure the vector is cast correctly.

    const { entityType, entityId, kind, provider, model, dims, vector, textHash } = data;

    // Use a transaction or raw query to insert/update the vector
    // This is a naive implementation; production usually requires casting '...':vector

    // We'll try to use the Prisma create method first assuming TypedSQL or valid unchecked input,
    // but typically with Unsupported types we need raw SQL.

    // Fallback: Delete existing specific embedding then create new one (simplest 'upsert' for vectors without unique constraint fighting)
    // Actually we have a unique constraint: @@unique([entityType, entityId, kind, model])

    const exists = await prisma.embedding.findUnique({
      where: {
        entityType_entityId_kind_model: {
          entityType,
          entityId,
          kind,
          model,
        },
      },
    });

    if (exists) {
      // Update
      await prisma.$executeRaw`
        UPDATE "Embedding"
        SET 
          vector = ${vector}::vector,
          "textHash" = ${textHash},
          "updatedAt" = NOW()
        WHERE id = ${exists.id}
      `;
      return exists.id;
    } else {
      // Create
      // We explicitly need to cast the string to vector
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "entityType", "entityId", "kind", "provider", "model", "dims", "vector", "textHash", "createdAt")
        VALUES (${id}, cast(${entityType} as "EmbeddingEntityType"), ${entityId}, cast(${kind} as "EmbeddingKind"), ${provider}, ${model}, ${dims}, ${vector}::vector, ${textHash}, NOW())
      `;
      return id;
    }
  }

  async findEmbedding(data: {
    entityType: EmbeddingEntityType;
    entityId: string;
    kind: EmbeddingKind;
    model: string;
  }) {
    // We can use findFirst/findUnique to get metadata, but the vector field itself won't be usable in JS usually
    return prisma.embedding.findUnique({
      where: {
        entityType_entityId_kind_model: {
          entityType: data.entityType,
          entityId: data.entityId,
          kind: data.kind,
          model: data.model,
        },
      },
    });
  }
}
