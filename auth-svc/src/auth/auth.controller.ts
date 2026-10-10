import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, Res } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { FortyTwoGuard } from './guard/42.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
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
		const { access_token } = await this.authService.fortyTwoLogin(req.user);
		return res.redirect(`${process.env.FRONTEND_URL}/auth/42/done#token=${access_token}`);
	}
}