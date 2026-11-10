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
		/** A token that was logged out is refused, even if it has not expired yet. */
		const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
		if (token && await this.denylist.has(token)) { throw new UnauthorizedException(); }

		/**  */
		if (await this.denylist.isRevoked(payload.sub, payload.iat)) {
			throw new UnauthorizedException();
		}
		/** ⚠️ Invite, signup and reset tokens are signed with the same secret but carry a `purpose`.
		 *  They must never work as a login token, so any token with a purpose is refused here. */
		if (payload.purpose) { throw new UnauthorizedException(); }
		return payload;
	}
}