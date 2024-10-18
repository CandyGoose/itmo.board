export function a(): void {
    console.log('It works!');
}
a();

export function b(): void {
    console.log("This is function b");
}

export function c(condition: boolean): string {
    if (condition) {
        return 'Condition is true';
    } else {
        return 'Condition is false';
    }
}
