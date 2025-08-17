import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { pool } from '../db.js';
import { auth, adminGuard } from '../middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create order (user token optional, but recommended)
router.post('/', upload.single('slip'), async (req, res) => {
  try {
    const { name, phone, product, amount } = req.body;
    if (!name || !phone || !product || !amount) return res.status(400).json({ error: 'Missing fields' });

    let userId = null;
    const h = req.headers.authorization || '';
    if(h.startsWith('Bearer ')){
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const payload = jwt.verify(h.slice(7), process.env.JWT_SECRET);
        userId = payload.id;
      } catch {}
    }

    let slipUrl = null;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = 'data:' + req.file.mimetype + ';base64,' + b64;
      const up = await cloudinary.uploader.upload(dataUri, { folder: 'myshop_slips' });
      slipUrl = up.secure_url;
    }
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, customer_name, phone, product, amount_usd, slip_url, status) VALUES (?,?,?,?,?,?,?)',
      [userId, name, phone, product, amount, slipUrl, 'Pending']
    );
    res.json({ ok: true, id: result.insertId, slip_url: slipUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: list all (for admin page use fetch with admin header)
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error:'Server error' }); }
});

// User: my orders
router.get('/mine', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch(e){ console.error(e); res.status(500).json({ error:'Server error' }); }
});

// Admin: change status
router.patch('/:id/status', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending','Verified','Complete'];
    if(!allowed.includes(status)) return res.status(400).json({ error: 'Bad status' });
    await pool.execute('UPDATE orders SET status=? WHERE id=?', [status, id]);
    res.json({ ok:true });
  } catch(e){ console.error(e); res.status(500).json({ error:'Server error' }); }
});

// Admin: set delivery note (account/keys to deliver)
router.put('/:id/note', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    await pool.execute('UPDATE orders SET delivery_note=? WHERE id=?', [note || null, id]);
    res.json({ ok:true });
  } catch(e){ console.error(e); res.status(500).json({ error:'Server error' }); }
});

export default router;
