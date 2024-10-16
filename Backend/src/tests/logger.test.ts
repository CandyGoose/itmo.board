import logger from '../logger';
import { transports } from 'winston';

describe('Logger Tests', () => {
    it('should fail because it expects a non-existent console transport', () => {
        const consoleTransport = logger.transports.find(
            (transport) => transport instanceof transports.Console
        );
        expect(consoleTransport).toBeNull(); // Этот тест провалится, так как консольный транспорт существует
    });

    it('should fail because it expects a non-existent file transport', () => {
        const fileTransport = logger.transports.find(
            (transport) => transport instanceof transports.File
        );
        expect(fileTransport).toBeNull(); // Этот тест провалится, так как файловый транспорт существует
    });

    it('should log messages with the correct format', () => {
        const logMessage = 'Test log message';
        const spy = jest.spyOn(console, 'log').mockImplementation(); // Мокаем console.log для проверки

        logger.info(logMessage); // Логируем сообщение на уровне "info"

        // Ожидаем, что console.log будет вызван с правильным сообщением
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('[info]'));
        expect(spy).toHaveBeenCalledWith(expect.stringContaining(logMessage));

        spy.mockRestore(); // Восстанавливаем console.log
    });

    it('should fail because it expects the wrong log level', () => {
        const logMessage = 'Test log message';
        const spy = jest.spyOn(console, 'log').mockImplementation();

        logger.info(logMessage);

        // Ошибочное ожидание, которое гарантированно провалится
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('[error]')); // Этот тест провалится
        spy.mockRestore();
    });
});