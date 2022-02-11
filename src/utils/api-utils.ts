const defaultErrorMessage = 'Unexpected exception when talking to unleash-api';

export const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const extractJoiMsg = (body: any) => {
    return body.details.length > 0
        ? body.details[0].message
        : defaultErrorMessage;
};

export const extractLegacyMsg = (body: any[]) => {
    return body && body.length > 0 ? body[0].msg : defaultErrorMessage;
};

export class ServiceError extends Error {
    constructor(statusCode = 500) {
        super(defaultErrorMessage);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends Error {
    constructor(statusCode, body) {
        super('Authentication required');
        this.name = 'AuthenticationError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class ForbiddenError extends Error {
    constructor(statusCode, body = {}) {
        super(
            body.details?.length > 0
                ? body.details[0].message
                : 'You cannot perform this action'
        );
        this.name = 'ForbiddenError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class BadRequestError extends Error {
    constructor(statusCode, body = {}) {
        super(
            body.details?.length > 0 ? body.details[0].message : 'Bad request'
        );
        this.name = 'BadRequestError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class NotFoundError extends Error {
    constructor(statusCode) {
        super(
            'The requested resource could not be found but may be available in the future'
        );
        this.name = 'NotFoundError';
        this.statusCode = statusCode;
    }
}