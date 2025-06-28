import { HttpException } from "@nestjs/common";

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Type guard to check if error is an HttpException
 */
export function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}

/**
 * Type guard to check if error has status and message properties
 */
export function hasStatusAndMessage(
  error: unknown,
): error is { status: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    typeof (error as { status: unknown }).status === "number" &&
    typeof (error as { message: unknown }).message === "string"
  );
}
