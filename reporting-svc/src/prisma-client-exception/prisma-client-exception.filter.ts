import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";

import type { Response } from "express";
import { Prisma } from "src/generated/prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilte implements ExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {

		const response: Response = host.switchToHttp().getResponse<Response>();
		if (
			typeof exception === "object" &&
			exception !== null &&
			"code" in exception &&
			exception.code === "P2002"
		) {
			return response.status(HttpStatus.CONFLICT).json({
				statusCode: HttpStatus.CONFLICT,
				message: "A unique field already exists",
			});
		}
		return response.status(500).json({
			statusCode: 500,
			message: "Internal server error",
		});
	}
}
