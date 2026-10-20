import { IsIn } from 'class-validator'

export class UpdateMemberDto {
	/** @example 'Viewer' */
	@IsIn(['Admin', 'Analyst', 'Viewer'])
	role!: 'Admin' | 'Analyst' | 'Viewer';
}
