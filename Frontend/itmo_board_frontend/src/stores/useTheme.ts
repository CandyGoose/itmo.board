import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Получаем тему из localStorage, если она там есть, иначе возвращаем тему по умолчанию
 */
const getInitialTheme = (): ThemeState['theme'] => {
    const storedTheme = localStorage.getItem('theme-storage') as
        | ThemeState['theme']
        | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }
    // Если тема не сохранена в localStorage, то возвращаем тему из настроек браузера
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
};

/**
 * Хук для работы с темой.
 */
const useTheme = create<ThemeState>()(
    persist(
        (set) => ({
            theme: getInitialTheme(),
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),
            setTheme: (theme: 'light' | 'dark') => set({ theme }),
        }),
        {
            name: 'theme-storage', // Название ключа в localStorage
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export default useTheme;
