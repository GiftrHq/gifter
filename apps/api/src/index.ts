import { createApp } from './app';
import { ENV } from './config/env';

async function bootstrap() {
    const app = createApp();

    app.listen(ENV.port, () => {
        console.log(`Core API running on http://localhost:${ENV.port}`);
    });
}

bootstrap().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
});
