import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TwoFactorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
	) {}

	async setup(userId: string) {

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, is_2fa_enabled: true }
		})

		if (!user) { throw new NotFoundException()  }
		if (user.is_2fa_enabled) { throw new BadRequestException('Disable 2FA first') }

		const secret = authenticator.generateSecret();
		await this.prisma.user.update({
			where: { id: userId },
			data: { two_factor_secret: secret },
		});

		const otpauth_url = authenticator.keyuri(user.email, 'InsightFlow', secret);

		const qrcode = await QRCode.toDataURL(otpauth_url);

		return { qr_code: qrcode, otpauth_url }
	}

	async enable(userId: string, code: string) {

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { two_factor_secret: true, is_2fa_enabled: true }
		})

		if (!user) { throw new NotFoundException()  }
		if (user.is_2fa_enabled) { throw new BadRequestException('2FA is already enabled')  }
		if (!user.two_factor_secret) { throw new BadRequestException('Run 2FA setup first')  }

		const valid = authenticator.check(code, user.two_factor_secret);
		if (!valid) { throw new UnauthorizedException('Invalid code')  }

		await this.prisma.user.update({
			where: { id: userId },
			data: { is_2fa_enabled: true },
		});

		return { enabled: true };
	}

	async disable(userId: string, code: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { two_factor_secret: true, is_2fa_enabled: true }
		});
		if (!user) { throw new NotFoundException()  }
		if (!user.is_2fa_enabled) { throw new BadRequestException('2FA is already disabled')  }
		if (!user.two_factor_secret) { throw new BadRequestException('No 2FA secret found') }

		const valid = authenticator.check(code, user.two_factor_secret);
		if (!valid) { throw new UnauthorizedException('Invalid code')  }

		await this.prisma.user.update({
			where: { id: userId },
			data: { is_2fa_enabled: false, two_factor_secret: null },
		});

		return { enabled: false };
	}

	async verify(two_factor_token: string, code: string) {

		let payload: any;
		try {
			payload = await this.jwt.verifyAsync(two_factor_token);
		} catch (error) {
			throw new UnauthorizedException('Invalid or expired 2fa token') ;
		}
		if (payload.purpose !== '2fa') { throw new UnauthorizedException('Invalid or expired 2fa token')  }

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: { user_roles_organization: true }
		})
		
		if (!user || !user.is_2fa_enabled || !user.two_factor_secret) {
			throw new UnauthorizedException('Invalid or expired 2fa token')
		}

		const valid = authenticator.check(code, user.two_factor_secret);
		if (!valid) { throw new UnauthorizedException('Invalid code')  }
		
		const role = user.user_roles_organization[0];
		const access_token = await this.jwt.signAsync({
			sub: user.id,
			org_id: role.org_id,
			role: role.role,
		});

		return {
			access_token,
			token_type: 'Bearer',
			user: {
				id: user.id,
				org_id: role.org_id,
				email: user.email,
				role: role.role,
				created_at: user.created_at,
			},
		};		
	}
}

