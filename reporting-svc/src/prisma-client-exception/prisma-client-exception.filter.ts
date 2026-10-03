import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class PrismaClientExceptionFilter<T> implements ExceptionFilter {
	catch(
		exception: unknown,
		host: ArgumentsHost,
	) {
		const response = host.switchToHttp().getResponse();

		if (typeof exception === 'object' &&
			exception !== null &&
			'code' in exception &&
			exception.code === 'P2002') {
			return response.status(HttpStatus.CONFLICT).json({
				statusCode: HttpStatus.CONFLICT,
				message: 'A unique field already exists',
			});
		}
		if (exception instanceof HttpException) {
			return response.status(exception.getStatus()).json(
				exception.getResponse(),
			);
		} 
		return response.status(500).json({
			statusCode: 500,
			message: 'Internal server error',
		});
	}
}
