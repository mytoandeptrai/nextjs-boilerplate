export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}
