import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
}
