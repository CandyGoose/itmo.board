import { renderHook, act } from '@testing-library/react';
import { useRenameModal } from './useRenameModal';

describe('useRenameModal hook', () => {
    test('имеет начальное состояние по умолчанию', () => {
        const { result } = renderHook(() => useRenameModal());

        expect(result.current.isOpen).toBe(false);
        expect(result.current.initialValues).toEqual({ id: '', title: '' });
    });

    test('открывает модальное окно с корректными значениями', () => {
        const { result } = renderHook(() => useRenameModal());

        act(() => {
            result.current.onOpen('123', 'Test Title');
        });

        expect(result.current.isOpen).toBe(true);
        expect(result.current.initialValues).toEqual({
            id: '123',
            title: 'Test Title',
        });
    });

    test('закрывает модальное окно и сбрасывает значения', () => {
        const { result } = renderHook(() => useRenameModal());

        // Открываем окно
        act(() => {
            result.current.onOpen('123', 'Test Title');
        });

        // Закрываем окно
        act(() => {
            result.current.onClose();
        });

        expect(result.current.isOpen).toBe(false);
        expect(result.current.initialValues).toEqual({ id: '', title: '' });
    });

    test('открытие перезаписывает значения', () => {
        const { result } = renderHook(() => useRenameModal());

        act(() => {
            result.current.onOpen('123', 'Title 1');
        });

        // Открываем снова с новыми значениями
        act(() => {
            result.current.onOpen('456', 'Title 2');
        });

        expect(result.current.isOpen).toBe(true);
        expect(result.current.initialValues).toEqual({
            id: '456',
            title: 'Title 2',
        });
    });
});
