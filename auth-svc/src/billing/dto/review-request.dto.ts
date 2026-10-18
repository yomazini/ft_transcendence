import { IsEnum } from 'class-validator';
import { RequestStatus } from '../../../generated/prisma/enums';

export class ReviewRequestDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}