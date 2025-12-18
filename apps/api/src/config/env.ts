import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 4000,
    databaseUrl: process.env.DATABASE_URL!,
    commerceServiceUrl: process.env.COMMERCE_SERVICE_URL || 'http://localhost:7070',
    pythonAiUrl: process.env.PYTHON_AI_URL || 'http://localhost:8000',
};
