import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateJobDto {
  @ApiProperty({ example: 'Freelance pricing research' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
