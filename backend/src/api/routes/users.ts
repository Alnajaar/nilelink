import { Router } from 'express';

const router = Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    res.json({ success: true, data: { user: { id: req.params.id } } });
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    res.json({ success: true, message: 'User updated' });
});

export default router;