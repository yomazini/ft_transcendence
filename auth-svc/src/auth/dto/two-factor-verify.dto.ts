import { IsJWT, IsString } from 'class-validator'
import { TwoFactorCodeDto } from './two-factor-code.dto';

export class VerifyTwoFactorDto extends TwoFactorCodeDto {
	@IsString()
	@IsJWT()
	two_factor_token!: string;
}