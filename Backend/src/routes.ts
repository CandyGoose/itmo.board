import express from 'express';

const router = express.Router();

router.get('/data', (req, res) => {
    res.json({ message: 'Here is some data' });
});

router.post('/data', (req, res) => {
    const { data } = req.body;
    if (data) {
        res.status(201).json({ message: 'Data added', data });
    } else {
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Дополнительная функция, которая не будет покрыта тестами
export function untestedFunction() {
    console.log('This function is not covered by tests');
}

// Ещё один не покрытый код
export function untestedCondition(condition: boolean): string {
    if (condition) {
        return 'Condition is true';
    } else {
        return 'Condition is false';
    }
}

export default router;
