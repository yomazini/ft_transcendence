import { Injectable } from '@nestjs/common';

/** 
 * ⚠️ A JWT can't be cancelled, so logout writes it on a "blocked" list, and every protected request checks that list until the token would have expired anyway. 
 * @Bug read file ?/bugs.md
 */
@Injectable()
export class TokenDenylist {
	private readonly tokens = new Map<string, number>();

	add(token: string, expSeconds: number) {
		this.tokens.set(token, expSeconds * 1000);
	}

	has(token: string): boolean {
		const now = Date.now();
		for (const [t, exp] of this.tokens) {
			if (exp < now) this.tokens.delete(t);
		}
		return this.tokens.has(token);
	}
}
