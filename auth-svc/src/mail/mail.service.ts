import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);

	constructor(private readonly mailer: MailerService) {}

	async sendInvite(email: string, link: string) {
		try {
			await this.mailer.sendMail({
				to: email,
				subject: 'You have been invited to join an organization',
				text: `Open this link to set your password and join: ${link}`,
				html: `<p>You have been invited to join an organization.</p><p><a href="${link}">Set your password and join</a></p>`,
			});
		} catch (error: any) {
			this.logger.error(`Invite not sent: ${error.message}`);
			throw new ServiceUnavailableException('Could not send the email right now, try again in a few seconds');
		}
	}

	async sendPasswordReset(email: string, link: string) {
		try {
			await this.mailer.sendMail({
				to: email,
				subject: 'Reset your password',
				text: `Open this link to choose a new password (valid for 15 minutes): ${link}`,
				html: `<p>We received a request to reset your password.</p><p><a href="${link}">Choose a new password</a> (valid for 15 minutes)</p><p>If you did not ask for this, ignore this email.</p>`,
			});
		} catch (error: any) {
			this.logger.error(`Password reset email not sent: ${error.message}`);
		}
	}

	async sendExportReceipt(email: string) {
		const date = new Date().toUTCString();
		try {
			await this.mailer.sendMail({
				to: email,
				subject: 'Your data export',
				text: `A copy of your personal data was exported on ${date}. If this was not you, change your password now.`,
				html: `<p>A copy of your personal data was exported on ${date}.</p><p>If this was not you, change your password now.</p>`,
			});
		} catch (error: any) {
			this.logger.error(`Export receipt not sent: ${error.message}`);
		}
	}

	async sendDeletionReceipt(email: string) {
		const date = new Date().toUTCString();
		try {
			await this.mailer.sendMail({
				to: email,
				subject: 'Your account was deleted',
				text: `Your account and its personal data were deleted on ${date}. This email is your confirmation.`,
				html: `<p>Your account and its personal data were deleted on ${date}.</p><p>This email is your confirmation.</p>`,
			});
		} catch (error: any) {
			this.logger.error(`Deletion receipt not sent: ${error.message}`);
		}
	}
}
