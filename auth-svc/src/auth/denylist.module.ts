import { Module } from '@nestjs/common';
import { TokenDenylist } from './token-denylist.service';

@Module({
	providers: [TokenDenylist],
	exports: [TokenDenylist],
})
export class DenylistModule {}
