import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      let result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      let user = result.rows[0];
      
      if (!user) {
        result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        user = result.rows[0];
        
        if (!user) {
          result = await db.query(
            'INSERT INTO users (name, email, google_id, verified) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, googleId, true]
          );
          user = result.rows[0];
        } else {
          await db.query('UPDATE users SET google_id = $1, verified = $2 WHERE email = $3', [googleId, true, email]);
          result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
          user = result.rows[0];
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = result.rows[0];
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
