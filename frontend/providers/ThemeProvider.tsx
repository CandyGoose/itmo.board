"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface IThemeContext {
    theme: string;
    setTheme: (value: "system" | "light" | "dark") => void;
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeContext = createContext<IThemeContext | null>(null);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<string>("system");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "system";
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme: string) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        root.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        setThemeState(newTheme);
    };

    const setTheme = (newTheme: "system" | "light" | "dark") => {
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};