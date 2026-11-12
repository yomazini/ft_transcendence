import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { JwtGuard } from '../guard/jwt.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorCodeDto } from '../dto';

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

	/* POST /auth/2fa/enable {code} */
	@Post('enable')
	@HttpCode(200)
	@UseGuards(JwtGuard)
	enableTwoFactor(@Req() req, @Body() dto: TwoFactorCodeDto) {
		return this.twoFactorService.enable(req.user.sub, dto.code);
	}

	/* POST /auth/2fa/disable {code} */
	@Post('disable')
	@HttpCode(200)
	@UseGuards(JwtGuard)
	disableTwoFactor(@Req() req, @Body() dto: TwoFactorCodeDto) {
		return this.twoFactorService.disable(req.user.sub, dto.code);
	}
}
