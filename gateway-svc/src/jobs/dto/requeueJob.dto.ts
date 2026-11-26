import { IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RequeueJobDto {
  @ApiProperty({ example: 'a6caa549-1bc9-46e2-93d2-d5c5cd37e6f4' })
  @IsUUID()
  id!: string;
}
