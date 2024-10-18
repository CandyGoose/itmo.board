import { createLogger, format } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(format.colorize(), format.timestamp()),
});

export default logger;
