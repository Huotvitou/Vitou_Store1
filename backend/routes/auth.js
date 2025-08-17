import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if(!name || !phone || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const [dup] = await pool.execute('SELECT id FROM users WHERE email=?', [email]);
    if(dup.length) return res.status(409).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.execute('INSERT INTO users (name, phone, email, password_hash) VALUES (?,?,?,?)', [name, phone, email, hash]);
    const token = jwt.sign({ id: r.insertId, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok:true, token, user:{ id:r.insertId, name, email } });
  } catch(e){ console.error(e); res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email=?', [email]);
    if(!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u.id, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok:true, token, user:{ id:u.id, name:u.name, email:u.email } });
  } catch(e){ console.error(e); res.status(500).json({ error: 'Server error' }); }
});

export default router;
