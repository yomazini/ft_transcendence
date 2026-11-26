
import { IsEnum } from 'class-validator';

export enum PaidPlan {
  premium = 'Premium',
  extra = 'Extra',
}

export class CheckoutDto {
  @IsEnum(PaidPlan)
  plan!: PaidPlan;
}
