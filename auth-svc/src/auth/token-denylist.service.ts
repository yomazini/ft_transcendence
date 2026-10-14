import { Injectable } from '@nestjs/common';

/** Tokens that were logged out before they expired.
 *  A JWT cannot be "deleted", so logout puts it on this list until its own expiry.
 *  Kept in memory: a restart of auth-svc empties the list (tokens live 1 hour at most). */
@Injectable()
export class TokenDenylist {
	private readonly tokens = new Map<string, number>(); // token -> expiry (ms)

	add(token: string, expSeconds: number) {
		this.tokens.set(token, expSeconds * 1000);
	}

	has(token: string): boolean {
		const now = Date.now();
		for (const [t, exp] of this.tokens) {
			if (exp < now) this.tokens.delete(t); // expired anyway: forget it
		}
		return this.tokens.has(token);
	}
}
