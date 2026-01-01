"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.ForbiddenException = exports.UnAuthorizedException = exports.ConflictException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode = 400, options) {
        super(message, options);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationException {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends ApplicationException {
    constructor(message, options) {
        super(message, 401, options);
    }
}
exports.ConflictException = ConflictException;
class UnAuthorizedException extends ApplicationException {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.UnAuthorizedException = UnAuthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message, options) {
        super(message, 403, options);
    }
}
exports.ForbiddenException = ForbiddenException;
const globalErrorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Something Went Wrong",
        stack: process.env.MODE === "DEV" ? err.stack : undefined,
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
