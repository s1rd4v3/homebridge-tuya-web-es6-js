export class RatelimitError extends Error {
    constructor(message, reason) {
        if (reason) {
            message += ` - ${reason}`;
        }
        super(message);
    }
}
