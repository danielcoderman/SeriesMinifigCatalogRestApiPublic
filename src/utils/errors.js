export class RebrickableAPIError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'RebrickableAPIError';
        this.status = status;
    }
}