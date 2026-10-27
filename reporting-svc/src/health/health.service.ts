import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
	getHealth() {
		return {
			status: 'healthy',
			service: 'reporting-svc',
		};
	}
}
