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

let d