import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, Res, Delete } from '@nestjs/common';
import { AcceptInviteDto, ChangePasswordDto, Complete42Dto, DeleteAccountDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { FortyTwoGuard } from './guard/42.guard';
import { TokenDenylist } from './token-denylist.service';
import { ExtractJwt } from 'passport-jwt';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly denylist: TokenDenylist,
	) {}

	@Post('signup') /** POST /auth/signup */
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}
	@Post('login') /** POST /auth/login */
	@HttpCode(200)
	login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@UseGuards(JwtGuard)
	@Get('me') /** GET /auth/me */
	GetMe(@Req() req) {
		return this.authService.me(req.user.sub); /** req.user.sub == user ID */
	}

	@Get('42') /** GET /auth/42 */
	@UseGuards(FortyTwoGuard)
	fortyTwoAuth() {}
	/** stays empty permanently, It exists purely so there's a route for @UseGuards(FortyTwoGuard) to attach to; */

	@Get('42/callback') /** GET /auth/42/callback */
	@UseGuards(FortyTwoGuard)
	async fortyTwoAuthCallback(@Req() req, @Res() res) {

		const result = await this.authService.fortyTwoLogin(req.user);
		if ('signup_token' in result) {
			return res.redirect(`${process.env.FRONTEND_URL}/auth/42/complete#signup_token=${result.signup_token}`);
		}
		return res.redirect(`${process.env.FRONTEND_URL}/auth/42/done#token=${result.access_token}`);
	}

	@Post('42/complete') /** POST /auth/42/complete */
	complete42Auth(@Body() dto: Complete42Dto) {
		return this.authService.complete42Login(dto);
	}

	@Post('invite/accept') /** POST /auth/invite/accept */
	acceptInvitation(@Body() dto: AcceptInviteDto) {
		return this.authService.acceptInvite(dto);
	}

	@Post('change-password') /** POST /auth/change-password */
	@UseGuards(JwtGuard)
	@HttpCode(200)
	changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
		return this.authService.changePassword(req.user.sub, dto); 
		/** ⚠️ id from the token, never from the body
		 * The token is signed by the server, so the id inside it (req.user.sub) cannot be faked.
			The body is typed by the user, so anything in it can be a lie.
		*/
	}

	@Post('forgot-password') /** POST /auth/forgot-password */
	@HttpCode(200)
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto);
	}

	@Post('reset-password') /** POST /auth/reset-password */
	@HttpCode(200)
	resetPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}

	@Post('gdpr/export') /** POST auth/gdpr/export */
	@UseGuards(JwtGuard)
	@HttpCode(200)
	exportData(@Req() req) {
		return this.authService.exportData(req.user.sub);
	}

	@Delete('gdpr/delete') /** DELETE auth/gdpr/export */
	@UseGuards(JwtGuard)
	@HttpCode(204)
	deleteAccount(@Req() req, @Body() dto: DeleteAccountDto) {
		return this.authService.deleteAccount(req.user.sub, dto);
	}

	@Post('logout') /** POST /auth/logout */
	@UseGuards(JwtGuard)
	@HttpCode(204)
	logout(@Req() req) {
		const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
		if (token) { this.denylist.add(token, req.user.exp); }
	}

	/** GET /auth/verify — called by nginx (auth_request) before it forwards a request
	 *  to a service that has no auth of its own (reporting-svc). The ids are read from
	 *  the verified token and sent back as headers; nginx passes them on, so a client
	 *  can never choose which organization it reads. */
	@Get('verify')
	@UseGuards(JwtGuard)
	@HttpCode(204)
	verify(@Req() req, @Res({ passthrough: true }) res) {
		res.setHeader('X-User-Id', req.user.sub);
		res.setHeader('X-Org-Id', req.user.org_id);
		res.setHeader('X-Role', req.user.role);
	}
}
