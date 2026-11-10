import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'
import { createHash } from 'crypto';

/*
	* @notes:
	1.  how many seconds the token still has to live ?
	time to live (ttl) = ceiling(exp(sec) - now_date / 1000)
*/
@Injectable()
export class TokenDenylist {
	private readonly redis = new Redis({
		host: process.env.REDIS_HOST ?? "redis",
		port: Number(process.env.REDIS_PORT ?? 6379),
	});
	private keyOf(token: string): string {
		return `denylist:${createHash("sha256").update(token).digest("hex")}`;
	}
	

	async add(token: string, exp: number) {
		const ttl = Math.ceil(exp - Date.now() / 1000);
		if (ttl <= 0) { return ; } 
		const key = this.keyOf(token);
		await this.redis.set(key, "1", "EX", ttl);
	}


	async has(token: string): Promise<boolean> {
		const key = this.keyOf(token);
		const found =  await this.redis.exists(key);
		return found === 1;
	}
}
