import { IsUUID } from "class-validator";

export class ReportingHeadersDto {
	@IsUUID("4")
	"org-id": string;
}
