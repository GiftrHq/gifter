import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { useExpressServer } from 'routing-controllers';
import { HealthController } from './controllers/health.controller';
// later import: AuthController, UserController, RecommendationsController, etc.

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    useExpressServer(app, {
        routePrefix: '/api',
        controllers: [
            HealthController,
            // add more controllers here
        ],
        defaultErrorHandler: false, // you can add your own error middleware
    });

    return app;
}
