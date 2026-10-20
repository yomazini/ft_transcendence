import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, Res, Delete, Patch } from '@nestjs/common';
import { AcceptInviteDto, ChangeEmailDto, ChangePasswordDto, Complete42Dto, DeleteAccountDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { FortyTwoGuard } from './guard/42.guard';
import { TokenDenylist } from './token-denylist.service';
import { ExtractJwt } from 'passport-jwt';
import { MetricsService } from 'src/metrics/metrics.service';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly denylist: TokenDenylist,
		private readonly metrics: MetricsService,
	) {}

	@ApiResponse({ status: 201, description: 'User created' })
	@ApiResponse({ status: 400, description: 'Invalid body' })
	@ApiResponse({ status: 409, description: 'Email already used' })
	@Post('signup') /** POST /auth/signup */
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login') /** POST /auth/login */
	@HttpCode(200)
	@ApiResponse({ status: 200, description: 'Returns access_token' })
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@ApiBearerAuth()
	@UseGuards(JwtGuard)
	@ApiResponse({ status: 200, description: 'Current user' })
	@ApiResponse({ status: 401, description: 'Missing or invalid token' })
	@Get('me') /** GET /auth/me */
	GetMe(@Req() req) {
		return this.authService.me(req.user.sub); /** req.user.sub == user ID */
	}

	@Get('42') /** GET /auth/42 */
	@UseGuards(FortyTwoGuard)
	@ApiResponse({ status: 302, description: 'Redirect (to 42 / to frontend)' })
	fortyTwoAuth() {}
	/** stays empty permanently, It exists purely so there's a route for @UseGuards(FortyTwoGuard) to attach to; */

	@Get('42/callback') /** GET /auth/42/callback */
	@UseGuards(FortyTwoGuard)
	@ApiResponse({ status: 302, description: 'Redirect (to 42 / to frontend)' })
	async fortyTwoAuthCallback(@Req() req, @Res() res) {

		const result = await this.authService.fortyTwoLogin(req.user);
		if ('signup_token' in result) {
			return res.redirect(`${process.env.FRONTEND_URL}/auth/42/complete#signup_token=${result.signup_token}`);
		}
		return res.redirect(`${process.env.FRONTEND_URL}/auth/42/done#token=${result.access_token}`);
	}

	@ApiResponse({ status: 201, description: 'Account created, returns access_token' })
	@ApiResponse({ status: 401, description: 'Invalid or expired signup_token' })
	@Post('42/complete') /** POST /auth/42/complete */
	complete42Auth(@Body() dto: Complete42Dto) {
		return this.authService.complete42Login(dto);
	}

	@ApiResponse({ status: 201, description: 'Invite accepted' })
	@ApiResponse({ status: 400, description: 'Invalid or expired invite' })
	@Post('invite/accept') /** POST /auth/invite/accept */
	acceptInvitation(@Body() dto: AcceptInviteDto) {
		return this.authService.acceptInvite(dto);
	}

	@ApiBearerAuth()
	@Post('change-password') /** POST /auth/change-password */
	@UseGuards(JwtGuard)
	@HttpCode(200)
	@ApiResponse({ status: 200, description: 'Password changed' })
	@ApiResponse({ status: 401, description: 'Wrong current password or bad token' })
	changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
		return this.authService.changePassword(req.user.sub, dto); 
		/** ⚠️ id from the token, never from the body
		 * The token is signed by the server, so the id inside it (req.user.sub) cannot be faked.
			The body is typed by the user, so anything in it can be a lie.
		*/
	}

	@ApiBearerAuth()
	@Patch('email') /** PATCH /auth/email */
	@UseGuards(JwtGuard)
	@ApiResponse({ status: 200, description: 'Email changed' })
	@ApiResponse({ status: 401, description: 'Bad token or password' })
	@ApiResponse({ status: 409, description: 'Email already used' })
	changeEmail(@Body() dto: ChangeEmailDto, @Req() req) {
		return this.authService.changeEmail(req.user.sub, dto);
	}

	@Post('forgot-password') /** POST /auth/forgot-password */
	@HttpCode(200)
	@ApiResponse({ status: 200, description: 'Always 200 (no email leak)' })
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto);
	}

	@Post('reset-password') /** POST /auth/reset-password */
	@HttpCode(200)
	@ApiResponse({ status: 200, description: 'Password reset' })
	@ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
	resetPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}

	@ApiBearerAuth()
	@Post('gdpr/export') /** POST auth/gdpr/export */
	@UseGuards(JwtGuard)
	@HttpCode(200)
	@ApiResponse({ status: 200, description: 'User data as JSON' })
	@ApiResponse({ status: 401, description: 'Missing or invalid token' })
	exportData(@Req() req) {
		return this.authService.exportData(req.user.sub);
	}

	@ApiBearerAuth()
	@Delete('gdpr/delete') /** DELETE auth/gdpr/export */
	@UseGuards(JwtGuard)
	@HttpCode(204)
	@ApiResponse({ status: 204, description: 'Account deleted' })
	@ApiResponse({ status: 401, description: 'Bad token or password' })
	deleteAccount(@Req() req, @Body() dto: DeleteAccountDto) {
		return this.authService.deleteAccount(req.user.sub, dto);
	}

	@ApiBearerAuth()
	@Post('logout') /** POST /auth/logout */
	@UseGuards(JwtGuard)
	@HttpCode(204)
	@ApiResponse({ status: 204, description: 'Token revoked' })
	@ApiResponse({ status: 401, description: 'Missing or invalid token' })
	logout(@Req() req) {
		const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
		if (token) { this.denylist.add(token, req.user.exp); }
		this.metrics.logouts.inc();
	}


	@ApiBearerAuth()
	/** TODO: Uderstand MORE */
	@Get('verify') /** GET /auth/verify 
	— called by nginx (auth_request) before it forwards a request
	 *  to a service that has no auth of its own (reporting-svc). */
	@UseGuards(JwtGuard)
	@HttpCode(204)
	@ApiResponse({ status: 204, description: 'Valid, sets X-User-Id / X-Org-Id / X-Role' })
	@ApiResponse({ status: 401, description: 'Missing or invalid token' })
	verify(@Req() req, @Res({ passthrough: true }) res) {
		res.setHeader('X-User-Id', req.user.sub);
		res.setHeader('X-Org-Id', req.user.org_id);
		res.setHeader('X-Role', req.user.role);
	}
}
