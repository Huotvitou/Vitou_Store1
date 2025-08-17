import jwt from 'jsonwebtoken';

export function auth(req, res, next){
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if(!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, name: payload.name };
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function adminGuard(req, res, next){
  const key = req.headers['x-admin-key'];
  if(!key || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Bad admin key' });
  next();
}
