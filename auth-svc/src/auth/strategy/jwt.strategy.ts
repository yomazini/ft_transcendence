import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenDenylist } from "../token-denylist.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly denylist: TokenDenylist) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET!,
			passReqToCallback: true,
		});
	}
	async validate(req: any, payload: any) {
		const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
		if (token && await this.denylist.has(token)) { throw new UnauthorizedException(); }

		if (await this.denylist.isRevoked(payload.sub, payload.iat)) {
			throw new UnauthorizedException();
		}
		if (payload.purpose) { throw new UnauthorizedException(); }
		return payload;
	}
}