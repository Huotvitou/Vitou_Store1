// Auth helpers
window.auth = {
  set(t){ localStorage.setItem('token', t); },
  get(){ return localStorage.getItem('token'); },
  clear(){ localStorage.removeItem('token'); },
  headers(){ const t=this.get(); return t?{ Authorization:'Bearer '+t }:{}; }
};
