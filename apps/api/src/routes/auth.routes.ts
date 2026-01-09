import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.get("/api/auth/session", AuthController.getSession);
  app.route({ method: ["GET", "POST"], url: "/api/auth/*", handler: AuthController.handleAuth });

}
