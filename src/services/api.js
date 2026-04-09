import axios from 'axios';

const BASE = process.env.REACT_APP_API;

// Create axios instance — auto-attach JWT to every request
const http = axios.create({ baseURL: BASE });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jwt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// If 401/403 → logout
http.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const login  = (data) => http.post('/auth/login',  data);
export const signup = (data) => http.post('/auth/signup', data);

// ── Measurements ──────────────────────────────────────
export const convert  = (body) => http.post('/api/measurements/convert',  body);
export const compare  = (body) => http.post('/api/measurements/compare',  body);
export const add      = (body) => http.post('/api/measurements/add',      body);
export const subtract = (body) => http.post('/api/measurements/subtract', body);
export const divide   = (body) => http.post('/api/measurements/divide',   body);

// ── History ───────────────────────────────────────────
export const getHistory        = ()   => http.get('/api/measurements/history');
export const getHistoryByOp    = (op) => http.get(`/api/measurements/history/${op}`);
export const getErrorHistory   = ()   => http.get('/api/measurements/history/errored');
export const getCount          = (op) => http.get(`/api/measurements/count/${op}`);
