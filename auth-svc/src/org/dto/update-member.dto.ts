import { IsIn } from 'class-validator'

export class UpdateMemberDto {
	@IsIn(['Admin', 'Analyst', 'Viewer'])
	role!: 'Admin' | 'Analyst' | 'Viewer';
}
