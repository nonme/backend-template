import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const { method, url, ip } = request;
    const userAgent = request.headers["user-agent"] ?? "";
    const startTime = Date.now();

    // Log incoming request with debug level (blue in console)
    this.logger.debug(
      `➤ ${method} ${url} - ${ip} - ${userAgent}`,
      "IncomingRequest",
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        const { statusCode } = response;

        // Format response time with color coding
        const responseTimeFormatted = this.formatResponseTime(responseTime);
        const statusIcon = this.getStatusIcon(statusCode);

        if (statusCode >= 500) {
          // Server errors - red
          this.logger.error(
            `${statusIcon} ${method} ${url} - ${statusCode} - ${responseTimeFormatted} - ${ip}`,
            "ResponseSent",
          );
        } else if (statusCode >= 400) {
          // Client errors - yellow
          this.logger.warn(
            `${statusIcon} ${method} ${url} - ${statusCode} - ${responseTimeFormatted} - ${ip}`,
            "ResponseSent",
          );
        } else {
          // Success - green
          this.logger.log(
            `${statusIcon} ${method} ${url} - ${statusCode} - ${responseTimeFormatted} - ${ip}`,
            "ResponseSent",
          );
        }
      }),
    );
  }

  private formatResponseTime(responseTime: number): string {
    if (responseTime < 100) return `${responseTime}ms`;
    if (responseTime < 500) return `${responseTime}ms ⚠️`;
    return `${responseTime}ms 🐌`;
  }

  private getStatusIcon(statusCode: number): string {
    if (statusCode >= 500) return "❌";
    if (statusCode >= 400) return "⚠️";
    if (statusCode >= 300) return "↩️";
    return "✅";
  }
}
