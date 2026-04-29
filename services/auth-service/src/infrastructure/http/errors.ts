export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const authInvalidTokenError = (): AuthError =>
  new AuthError("AUTH_001", "Token invalido o expirado", 401);

export const authForbiddenError = (): AuthError =>
  new AuthError("AUTH_002", "Permisos insuficientes", 403);
