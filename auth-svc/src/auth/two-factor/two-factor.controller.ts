import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { JwtGuard } from '../guard/jwt.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/* /auth/2fa/ */
@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/2fa')
export class TwoFactorController {
	constructor(
		private readonly  twoFactorService: TwoFactorService,
	) {}

	/** POST /auth/2fa/setup */
	@Post('setup')
	@UseGuards(JwtGuard)
	setupTwoFactor(@Req() req) {
		return this.twoFactorService.setup(req.user.sub);
	}
}
