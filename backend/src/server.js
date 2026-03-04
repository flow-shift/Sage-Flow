import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.json({ message: 'Sage Flow API' }));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

initDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
