import { BadRequestException, Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { Complete42Dto, LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
	) {}

	async register(dto: RegisterDto) {
		try {
			const hash = await argon.hash(dto.password);
			const org = await this.prisma.organization.create({
				data: {
					name:dto.org_name,
					description: dto.org_description,
				}
			});
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					password: hash,
				},
			});
			const role = await this.prisma.role_and_organization.create({
				data: {
					user_id: user.id,
					org_id: org.id,
					role: 'Admin',
				},
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

			const org = await this.prisma.organization.create({
				data: {
					name: dto.org_name,
					description: dto.org_description,
				},
			});

			const user = await this.prisma.user.create({
				data: {
					email: payload.email,
					password: hash,
				},
			})

			const role = await this.prisma.role_and_organization.create({
				data: {
					user_id: user.id,
					org_id: org.id,
					role: 'Admin',
				},
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
}
