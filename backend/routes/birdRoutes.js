import express from 'express';
import Bird from '../models/Bird.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const birds = await Bird.getAll();
        res.json(birds);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching birds.' });
    }
});

router.get('/latest', async (req, res) => {
    try {
        const latest = await Bird.getLatest();
        res.json(latest);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching latest bird.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const bird = req.body;
        const savedBird = await Bird.save(bird);
        res.json(savedBird);
    } catch (error) {
        res.status(500).json({ error: 'Error saving bird.' });
    }
});

export default router;
