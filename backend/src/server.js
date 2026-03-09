import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import pg from 'pg';

dotenv.config();

const app = express();
const PgSession = connectPg(session);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(session({ 
  store: new PgSession({ pool, createTableIfMissing: true }),
  secret: process.env.JWT_SECRET || 'secret', 
  resave: false, 
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.json({ message: 'Sage Flow API' }));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

initDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
