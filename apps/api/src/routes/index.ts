import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { meRoutes } from './me.routes.js';
import { recipientsRoutes } from './recipients.routes.js';
import { productsRoutes } from './products.routes.js';
import { wishlistsRoutes } from './wishlists.routes.js';
import { occasionsRoutes } from './occasions.routes.js';
import { notificationsRoutes } from './notifications.routes.js';
import { telemetryRoutes } from './telemetry.routes.js';
import { integrationsRoutes } from './integrations.routes.js';
import { authRoutes } from './auth.routes.js';
import { onboardingRoutes } from './onboarding.routes.js';
import { collectionsRoutes } from './collections.routes.js';
import { addressesRoutes } from './addresses.routes.js';

export async function registerRoutes(app: FastifyInstance) {
  // Public routes
  await app.register(healthRoutes, { prefix: '/v1' });

  // Authenticated routes
  await app.register(authRoutes); // Register auth routes without /v1 prefix, as better-auth itself uses /api/auth
  await app.register(meRoutes, { prefix: '/v1' });
  await app.register(recipientsRoutes, { prefix: '/v1' });
  await app.register(productsRoutes, { prefix: '/v1' });
  await app.register(wishlistsRoutes, { prefix: '/v1' });
  await app.register(occasionsRoutes, { prefix: '/v1' });
  await app.register(notificationsRoutes, { prefix: '/v1' });
  await app.register(telemetryRoutes, { prefix: '/v1' });
  await app.register(onboardingRoutes, { prefix: '/v1/onboarding' });
  await app.register(collectionsRoutes, { prefix: '/v1/collections' });
  await app.register(addressesRoutes, { prefix: '/v1/me' });

  // Internal webhook routes
  await app.register(integrationsRoutes, { prefix: '/v1' });
}
