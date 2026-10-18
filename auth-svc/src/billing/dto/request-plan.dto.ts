import { IsEnum, IsOptional } from 'class-validator';
import { Action, Plan } from '../../../generated/prisma/enums';

export class RequestPlanDto {
  @IsEnum(Action)
  action!: Action;

  @IsOptional()
  @IsEnum(Plan)
  target_plan?: Plan;
}