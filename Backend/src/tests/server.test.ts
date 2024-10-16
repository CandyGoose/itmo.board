describe('Backend Tests', () => {
    it('should log the correct console output', () => {
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {}); // Мокаем console.log для отслеживания
        require('../server'); // a() function gets triggered here
        expect(consoleSpy).toHaveBeenCalledWith('It works!'); // Тест теперь пройдет, так как сообщение правильное
        consoleSpy.mockRestore(); // Восстановление состояния console после теста
    });

    it('should confirm that function a() returns nothing', () => {
        const returnValue = require('../server').a();
        expect(returnValue).toBeUndefined(); // Тест пройдет, так как a() возвращает void
    });
});
