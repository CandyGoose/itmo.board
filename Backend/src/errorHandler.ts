import { Request, Response } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response
) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
};

// Дополнительная не покрытая функция
export function untestedFunction() {
    console.log('This function is not covered by tests');
}

// Дополнительная не покрытая ветвь
export function untestedCondition(condition: boolean): string {
    if (condition) {
        return "Condition is true";
    } else {
        return "Condition is false";
    }
}