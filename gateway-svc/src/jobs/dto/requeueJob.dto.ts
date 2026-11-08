import { IsUUID } from 'class-validator';

export class RequeueJobDto {
  @IsUUID()
  id!: string;
}
