export function a(): void {
    console.log('It works!');
}
a();

// Не используемые функции, которые не будут покрываться тестами
export function b(): void {
    console.log("This is function b, but it's never tested");
}

export function c(condition: boolean): string {
    if (condition) {
        return 'Condition is true';
    } else {
        return 'Condition is false';
    }
}

// Новый функционал, который не покрыт тестами
export function d(input: number): number {
    if (input > 0) {
        console.log('Input is positive');
        return input * 2;
    } else if (input < 0) {
        console.log('Input is negative');
        return input - 2;
    } else {
        console.log('Input is zero');
        return 0;
    }
}

d(123);
