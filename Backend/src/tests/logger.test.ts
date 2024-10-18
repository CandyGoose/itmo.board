import logger from '../logger';
import { transports } from 'winston';

describe('Logger Tests', () => {
    it('should log messages to console', () => {
        const consoleTransport = logger.transports.find(
            (transport) => transport instanceof transports.Console,
        );
        expect(consoleTransport).toBeDefined();
    });
});
