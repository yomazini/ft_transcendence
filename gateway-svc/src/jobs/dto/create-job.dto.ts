import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerPersonaDto {
  @ApiPropertyOptional({ example: 'budget-conscious college students' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['budget', 'mid-market', 'premium'],
    example: 'budget',
  })
  @IsOptional()
  @IsIn(['budget', 'mid-market', 'premium', 'midMarket'])
  price_sensitivity?: string;

  @ApiPropertyOptional({ example: 'speed' })
  @IsOptional()
  @IsString()
  top_priority?: string;
}

export class CreateJobDto {
  @ApiProperty({
    enum: ['keyword', 'subreddit', 'post', 'user'],
    example: 'subreddit',
    description: 'Target extraction mode',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'keyword',
    'subreddit',
    'post',
    'user',
    'Keyword',
    'Subreddit',
    'Post',
    'User',
  ])
  mode: string;

  @ApiPropertyOptional({
    example: 'Freelance pricing research',
    description: 'Display name. Defaults to target when omitted.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'r/freelance',
    description: 'Target subreddit, search keyword, or Reddit post URL',
  })
  @IsNotEmpty()
  @IsString()
  target: string;

  @ApiPropertyOptional({ type: CustomerPersonaDto })
  @IsOptional()
  @IsObject()
  customer_persona?: CustomerPersonaDto;
}
