import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
	constructor(private readonly prisma: PrismaService) {}

	/** POST /auth/2fa/setup */
	async setup(userId: string) {

		/* 0. user email + is_2fa_enabled CHECK */
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, is_2fa_enabled: true }
		})

		if (!user) { throw new NotFoundException() /*404 */ }
		if (user.is_2fa_enabled) { throw new BadRequestException('Disable 2FA first') /* 400 */}

		/* 1. Create the secret */
		const secret = authenticator.generateSecret();
		/* 2. Store the secret in user table db */
		await this.prisma.user.update({
			where: { id: userId },
			data: { two_factor_secret: secret },
		});

		/* 3. generate otpauth_url */
		const otpauth_url = authenticator.keyuri(user.email, 'InsightFlow', secret);

		/* 4. generate the QR code */
		const qrcode = await QRCode.toDataURL(otpauth_url);

		/* fn. return QR code + link url */
		return { qr_code: qrcode, otpauth_url }
	}

	/* POST /auth/2fa/enable {code} */
	async enable(userId: string, code: string) {

		/* 0. query user secret + is_2fa_enabled CHECK */
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { two_factor_secret: true, is_2fa_enabled: true }
		})

		if (!user) { throw new NotFoundException() /* 404 */ }
		if (user.is_2fa_enabled) { throw new BadRequestException('2FA is already enabled') /* 400 */ }
		if (!user.two_factor_secret) { throw new BadRequestException('Run 2FA setup first') /* 400 */ }

		/* 1. Check the 6 digits against the saved secret (current 30 s window) */
		const valid = authenticator.check(code, user.two_factor_secret);
		if (!valid) { throw new UnauthorizedException('Invalid code') /* 401 */ }

		/* 2. turn 2FA on */
		await this.prisma.user.update({
			where: { id: userId },
			data: { is_2fa_enabled: true },
		});

		/* fn. return the new state */
		return { enabled: true };
	}

	/* POST /auth/2fa/disable {code} */
	async disable(userId: string, code: string) {
		/* 0. query user secret + is_2fa_disable CHECK */
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { two_factor_secret: true, is_2fa_enabled: true }
		});
		if (!user) { throw new NotFoundException() /* 404 */ }
		if (!user.is_2fa_enabled) { throw new BadRequestException('2FA is already disabled') /* 400 */ }
		if (!user.two_factor_secret) { throw new BadRequestException('No 2FA secret found') }
		/* @note two_factor_secret is String? (string | null) in the schema: TS needs this null check before authenticator.check(), even though it is always set when 2FA is on
		- errormssg: Argument of type 'string | null' is not assignable to parameter of type 'string'. Type 'null' is not assignable to type 'string'.
		*/

		/* 1. Check the code against the secret */
		const valid = authenticator.check(code, user.two_factor_secret);
		if (!valid) { throw new UnauthorizedException('Invalid code') /* 401 */ }

		/* 2. turn 2FA off */
		await this.prisma.user.update({
			where: { id: userId },
			data: { is_2fa_enabled: false, two_factor_secret: null },
		});

		/* fn. return the new state */
		return { enabled: false };
	}

}

