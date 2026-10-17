
import { IsEnum } from 'class-validator';
import { PlanType } from '../../../generated/prisma/client';

export class CheckoutDto {
  @IsEnum(PlanType)
  plan: PlanType;
}
