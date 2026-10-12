import { BadRequestException, Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AcceptInviteDto, ChangePasswordDto, Complete42Dto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly mail: MailService,
	) {}

	async register(dto: RegisterDto) {
		try {
			const hash = await argon.hash(dto.password);

			/** ⚠️ The org, the user and the membership are created in one transaction.
			 *  If the user fails (email already taken), the org is rolled back too,
			 *  so no org without an Admin stays in the database. */
			const { org, user, role } = await this.prisma.$transaction(async (tx) => {
				const org = await tx.organization.create({
					data: {
						name:dto.org_name,
						description: dto.org_description,
					}
				});
				const user = await tx.user.create({
					data: {
						email: dto.email,
						password: hash,
					},
				});
				const role = await tx.role_and_organization.create({
					data: {
						user_id: user.id,
						org_id: org.id,
						role: 'Admin',
					},
				});
				return { org, user, role };
			});
			const access_token = await this.jwt.signAsync({
				sub: user.id,
				org_id: org.id,
				role: role.role,
			})
			return {
				access_token,
				token_type: 'Bearer',
				user: {
					id: user.id,
					org_id: org.id,
					email: user.email,
					role: role.role,
					created_at: user.created_at,
				},
			};
		} catch (error: any) {
			if (error.code === 'P2002') { /* duplicate-email check */
				throw new BadRequestException('User already exists');
			}
			throw error;
		}
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
			include: { user_roles_organization: true },
		});
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const passwordMatches = await argon.verify(user.password, dto.password);
		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid credentials');
		}
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

	async me(userId: string) { 
		const user = await this.prisma.user.findUnique({
			where: {id: userId},
			include: { user_roles_organization: true },
		})
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const role = user.user_roles_organization[0];
		return {
			id: user.id,
			org_id: role.org_id,
			email: user.email,
			role: role.role,
			created_at: user.created_at,
		};
	}

	async fortyTwoLogin(profile: any) {
		/** 0. We search for the user by email */
		const email = profile.emails[0].value;
		const user = await this.prisma.user.findUnique({
			where: { email },
			include: { user_roles_organization: true },
		})
		/** 1. If the user doesn't exist, we create a new user */
		if (!user) {
			const signup_token = await this.jwt.signAsync({
				email,
				username: profile.username,
				purpose: 'complete-signup',}
				, { expiresIn: '10m' }
			)
			return { signup_token };
		}
		/** 2. If the user exists, we log them in */
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

	async complete42Login(dto: Complete42Dto) {
		let payload: any;
		try {
			payload = await this.jwt.verifyAsync(dto.signup_token);

		} catch (error) {
			throw new UnauthorizedException('Invalid or expired signup token');
		}
		if (payload.purpose !== 'complete-signup') {
			throw new UnauthorizedException('Invalid signup token');
		}

		try {
			const hash = await argon.hash(crypto.randomUUID());

			/** ⚠️ Same rule as register(): one transaction, so a failed user
			 *  does not leave an org without an Admin behind. */
			const { org, user, role } = await this.prisma.$transaction(async (tx) => {
				const org = await tx.organization.create({
					data: {
						name: dto.org_name,
						description: dto.org_description,
					},
				});

				const user = await tx.user.create({
					data: {
						email: payload.email,
						password: hash,
					},
				})

				const role = await tx.role_and_organization.create({
					data: {
						user_id: user.id,
						org_id: org.id,
						role: 'Admin',
					},
				});

				return { org, user, role };
			});

			const access_token = await this.jwt.signAsync({
				sub: user.id,
				org_id: org.id,
				role: role.role,
			})

			return {
				access_token,
				token_type: 'Bearer',
				user: {
					id: user.id,
					org_id: org.id,
					email: user.email,
					role: role.role,
					created_at: user.created_at,
				}
			}
		} catch(error: any) {
			if (error.code === 'P2002') { /* duplicate-email check */
				throw new BadRequestException('User already exists');
			}
			throw error;
		}
	}

	async acceptInvite(dto: AcceptInviteDto) {
		let payload: any;
		try {
			payload = await this.jwt.verifyAsync(dto.invite_token);
		} catch (error) {
			throw new UnauthorizedException('Invalid or expired invite token');
		}
		if (payload.purpose !== 'invite') {
			throw new UnauthorizedException('Invalid invite token');
		}
		try {
			const hash = await argon.hash(dto.password);

			/** ⚠️ The user and their membership are created in one transaction.
			 *  An invite is valid for 48 hours, and the org can be deleted in that time.
			 *  Without a transaction the user would be created, the membership would fail,
			 *  and a user with no org (who can never log in) would stay in the database. */
			const { user, role } = await this.prisma.$transaction(async (tx) => {
				const user = await tx.user.create({
					data: {
						email: payload.email,
						password: hash,
					},
				});

				const role = await tx.role_and_organization.create({
					data: {
						user_id: user.id,
						org_id: payload.org_id,
						role: payload.role,
					}
				})

				return { user, role };
			});

			const access_token = await this.jwt.signAsync({
				sub: user.id,
				org_id: payload.org_id,
				role: role.role,
			})

			return {
				access_token,
				token_type: 'Bearer',
				user: {
					id: user.id,
					org_id: payload.org_id,
					email: user.email,
					role: role.role,
					created_at: user.created_at,
				}
			}

		} catch (error: any) {
			if (error.code === 'P2002') { /* duplicate-email check */
				throw new BadRequestException('User already exists');
			}
			if (error.code === 'P2003') { /* the org in the invite was deleted */
				throw new BadRequestException('This organization no longer exists');
			}
			throw error;
		}
	}

	async changePassword(userId: string, dto: ChangePasswordDto) {
		const user = await this.prisma.user.findUnique({
			where: {id: userId},
		});

		if (!user) { throw new UnauthorizedException(); }

		const passwordMatches = await argon.verify(user.password, dto.current_password);
		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const hash = await argon.hash(dto.new_password);

		await this.prisma.user.update({
			where: { id: userId }, data: { password: hash },
		}) 
		return { message: 'Password changed'};
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		/** ⚠️ No error when the email is unknown: the reply is the same in both cases,
		 *  so nobody can use this route to find out which emails have an account. */
		if (user) {
			const reset_token = await this.jwt.signAsync({
				sub: user.id,
				purpose: 'reset'}, { expiresIn: '15m' }
			)

			const link = `${process.env.FRONTEND_URL}/reset-password#reset_token=${reset_token}`;

			await this.mail.sendPasswordReset(user.email, link);
		}

		return { message: 'If this email exists, a reset link was sent' };
	}

	async resetPassword(dto: ResetPasswordDto) {
		let payload: any;
		try {
			payload = await this.jwt.verifyAsync(dto.reset_token);
		} catch (error) {
			throw new UnauthorizedException('Invalid or expired reset token');
		}
		if (payload.purpose !== 'reset') {
			throw new UnauthorizedException('Invalid reset token');
		}

		const hash = await argon.hash(dto.new_password);

		try {
			await this.prisma.user.update({
				where: { id: payload.sub }, data: { password: hash },
			})
		} catch (error: any) {
			if (error.code === 'P2025') { /* the account was deleted after the email was sent */
				throw new UnauthorizedException('Invalid reset token');
			}
			throw error;
		}
		return { message: 'Password changed' };
	}
}
