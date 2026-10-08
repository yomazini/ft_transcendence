import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], /* lets this module construct it  */
  exports: [PrismaService], /* lets other modules (AuthModule, etc.) inject it after importing PrismaModule */
})
export class PrismaModule {}
