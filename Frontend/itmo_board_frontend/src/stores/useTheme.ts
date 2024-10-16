import { create } from 'zustand';
import { persist, createJSONStorage, PersistStorage } from 'zustand/middleware';

interface ThemeState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const defaultTheme: ThemeState['theme'] = 'light';

/**
 * Получаем тему из localStorage, если она там есть, иначе возвращаем тему по умолчанию
 */
export const getInitialTheme = (): ThemeState['theme'] => {
    if (typeof window !== 'undefined') {
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
    }
    return defaultTheme;
};

/**
 * Пустое хранилище, которое ничего не делает, используется при SSR
 */
const noopStorage: PersistStorage<unknown> = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
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
            storage:
                typeof window !== 'undefined'
                    ? createJSONStorage(() => localStorage)
                    : noopStorage,
            onRehydrateStorage: () => (state) => {
                if (state?.theme) {
                    // Действия при загрузке темы из localStorage
                }
            },
        },
    ),
);

export default useTheme;
