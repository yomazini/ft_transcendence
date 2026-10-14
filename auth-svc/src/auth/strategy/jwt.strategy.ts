import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET!,
		});
	}
	async validate(payload: any) {
		/** ⚠️ Invite, signup and reset tokens are signed with the same secret but carry a `purpose`.
		 *  They must never work as a login token, so any token with a purpose is refused here. */
		if (payload.purpose) { throw new UnauthorizedException(); }
		return payload;
	}
}