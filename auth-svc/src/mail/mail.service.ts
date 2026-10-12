import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
	constructor(private readonly mailer: MailerService) {}

	async sendInvite(email: string, link: string) {
		await this.mailer.sendMail({
			to: email,
			subject: 'You have been invited to join an organization',
			text: `Open this link to set your password and join: ${link}`,
			html: `<p>You have been invited to join an organization.</p><p><a href="${link}">Set your password and join</a></p>`,
		});
	}

	async sendPasswordReset(email: string, link: string) {
		await this.mailer.sendMail({
			to: email,
			subject: 'Reset your password',
			text: `Open this link to choose a new password (valid for 15 minutes): ${link}`,
			html: `<p>We received a request to reset your password.</p><p><a href="${link}">Choose a new password</a> (valid for 15 minutes)</p><p>If you did not ask for this, ignore this email.</p>`,
		});
	}
}
