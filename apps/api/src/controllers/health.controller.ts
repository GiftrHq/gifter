import { JsonController, Get } from 'routing-controllers';

@JsonController('/health')
export class HealthController {
    @Get()
    health() {
        return { status: 'ok' };
    }
}
