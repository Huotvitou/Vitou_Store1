import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.json({ ok: true, message: 'API running' }));
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
