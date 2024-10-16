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
        res.status(400).json({ message: 'Invalid data' }); // <-- Эта ветвь может быть непокрыта
    }
});

export default router;
