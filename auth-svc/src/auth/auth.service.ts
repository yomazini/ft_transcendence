import { BadRequestException, Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { LoginDto, RegisterDto } from './dto';
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
					password:hash,
				},
			});
			const role = await this.prisma.role_and_organization.create({
				data: {
					user_id: user.id,
					org_id: org.id,
					role: 'Admin',
				},
			});
			const access_token = await this.jwt.signAsync ({
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
		const email = profile.emails[0].value;
		const user = await this.prisma.user.findUnique({
			where: { email },
			include: { user_roles_organization: true },
		})
		if (!user) {
			try {
				const org = await this.prisma.organization.create({
					data: {
						name: `${profile.username}'s Workspace`,
						description: `${profile.username}'s personal workspace, created automatically on first login with 42. You can edit this description later from your organization settings page.`,
					},
				});
				const new_user = await this.prisma.user.create({
					data: {
						email,
						password: await argon.hash(crypto.randomUUID()),
					},
				});
				await this.prisma.role_and_organization.create({
					data: {
						user_id: new_user.id,
						org_id: org.id,
						role: 'Admin',
					},
				});
				const access_token = await this.jwt.signAsync({
					sub: new_user.id,
					org_id: org.id,
					role: 'Admin',
				});
				return {
					access_token,
					token_type: 'Bearer',
					user: {
						id: new_user.id,
						org_id: org.id,
						email: new_user.email,
						role: 'Admin',
						created_at: new_user.created_at,
					},
				};
			} catch (error: any) {
				if (error.code === 'P2002') {
					/* another request created this user milliseconds earlier — recurse once to log them in normally */
					return this.fortyTwoLogin(profile);
				}
				throw error;
			}
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
}
