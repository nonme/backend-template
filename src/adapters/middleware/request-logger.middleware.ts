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

interface SanitizedBody {
  [key: string]: unknown;
}

interface RequestDetails {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  contentType: string;
  contentLength: string;
  authorization: string;
  body?: SanitizedBody;
  query?: unknown;
}

interface ResponseDetails {
  method: string;
  url: string;
  statusCode: number;
  responseTime: string;
  ip: string;
  contentLength: string;
  body?: SanitizedBody | { summary: string; type: string };
}

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const { method, url, ip } = request;
    const userAgent = request.headers["user-agent"] ?? "";
    const contentType = request.headers["content-type"] ?? "";
    const contentLength = request.headers["content-length"] ?? "0";
    const authorization = request.headers.authorization ? "Bearer ***" : "none";
    const startTime = Date.now();

    // Log incoming request with detailed information
    const requestDetails: RequestDetails = {
      method,
      url,
      ip,
      userAgent,
      contentType,
      contentLength: `${contentLength}bytes`,
      authorization,
      body: this.sanitizeBody(request.body),
      query:
        Object.keys(request.query ?? {}).length > 0 ? request.query : undefined,
    };

    this.logger.log(`➤ ${method} ${url} - ${ip}`);

    this.logger.debug({
      method,
      url,
      ip,
      userAgent,
      contentType,
      authorization,
      body: requestDetails.body,
      query: requestDetails.query,
    });

    return next.handle().pipe(
      tap((responseBody) => {
        const responseTime = Date.now() - startTime;
        const { statusCode } = response;
        const responseContentLength =
          response.getHeader("content-length") ?? "0";

        const responseTimeFormatted = this.formatResponseTime(responseTime);
        const statusIcon = this.getStatusIcon(statusCode);

        const responseDetails: ResponseDetails = {
          method,
          url,
          statusCode,
          responseTime: `${responseTime}ms`,
          ip,
          contentLength: `${String(responseContentLength)}bytes`,
          body: this.sanitizeResponseBody(responseBody),
        };

        const logMessage = `${statusIcon} ${method} ${url} - ${statusCode} - ${responseTimeFormatted} - ${ip}`;

        const responseData = {
          method,
          url,
          statusCode,
          responseTime,
          ip,
          contentLength: responseDetails.contentLength,
          body: responseDetails.body,
        };

        if (statusCode >= 500) {
          this.logger.error(logMessage);
        } else if (statusCode >= 400) {
          this.logger.warn(logMessage);
        } else {
          this.logger.log(logMessage);
        }

        this.logger.debug(responseData);
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

  private sanitizeBody(body: unknown): SanitizedBody | undefined {
    if (!body) return undefined;

    try {
      // Clone the body to avoid modifying the original
      const sanitized = JSON.parse(JSON.stringify(body)) as Record<
        string,
        unknown
      >;

      // List of sensitive fields to redact
      const sensitiveFields = [
        "password",
        "token",
        "secret",
        "key",
        "authorization",
        "auth",
        "credential",
        "credentials",
      ];

      const redactSensitiveData = (obj: unknown): unknown => {
        if (typeof obj !== "object" || obj === null) return obj;

        if (Array.isArray(obj)) {
          return obj.map(redactSensitiveData);
        }

        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(
          obj as Record<string, unknown>,
        )) {
          const lowerKey = key.toLowerCase();
          const isSensitive = sensitiveFields.some((field) =>
            lowerKey.includes(field),
          );

          if (isSensitive) {
            result[key] = "***REDACTED***";
          } else if (typeof value === "object" && value !== null) {
            result[key] = redactSensitiveData(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      };

      return redactSensitiveData(sanitized) as SanitizedBody;
    } catch {
      return { error: "Could not serialize body" };
    }
  }

  private sanitizeResponseBody(
    body: unknown,
  ): SanitizedBody | { summary: string; type: string } | undefined {
    if (!body) return undefined;

    try {
      // For large responses, only log a summary
      const bodyStr = JSON.stringify(body);
      if (bodyStr.length > 1000) {
        return {
          summary: `Large response (${bodyStr.length} chars)`,
          type: Array.isArray(body)
            ? `Array[${(body as unknown[]).length}]`
            : typeof body,
        };
      }

      // Apply same sanitization as request body
      return this.sanitizeBody(body);
    } catch {
      return { error: "Could not serialize response body" };
    }
  }
}
