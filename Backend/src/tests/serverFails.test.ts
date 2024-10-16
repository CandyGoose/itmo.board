describe('Failing Backend Tests', () => {
    it('should fail because it expects the wrong console output', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(); // Специально отслеживаем console.log
        require('../server'); // a() function gets triggered here
        expect(consoleSpy).toHaveBeenCalledWith("Wrong output!"); // Этот тест провалится, так как вывод "It works!"
        consoleSpy.mockRestore(); // Восстановление состояния console после теста
    });

    it('should fail when expecting a function to return a value', () => {
        const returnValue = require('../server').a();
        expect(returnValue).toBe("Something"); // Этот тест провалится, так как a() возвращает void
    });
});