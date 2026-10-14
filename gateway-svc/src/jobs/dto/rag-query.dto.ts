import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RagQueryDto {
  @ApiProperty({ example: 'a6caa549-1bc9-46e2-93d2-d5c5cd37e6f4' })
  @IsUUID()
  job_id: string;

  @ApiProperty({ example: 'What do users complain about regarding pricing?' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  query: string;
}
