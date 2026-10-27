
import { IsEnum, IsUUID } from 'class-validator';

export enum PaidPlan {
  premium = 'premium',
  extra = 'extra',
}

export class CheckoutDto {
  @IsEnum(PaidPlan)
  plan!: PaidPlan;

  @IsUUID()
  idempotency_key!: string;
}
