import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LineStrategy } from 'passport-line-auth';
import { Strategy as GitHubStrategy } from 'passport-github';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from './models/User';

const passportConfig = {
  usernameField: 'email',
  passwordField: 'password',
  session: false,
};

passport.use(
  'local',
  new LocalStrategy(passportConfig, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(new Error('メールアドレスまたはパスワードが違います。'));
      }

      if (!user.password) {
        return done(new Error('このメールアドレスはソーシャルログインを利用しています。'));
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return done(new Error('メールアドレスまたはパスワードが違います。'));
      }

      return done(null, user);
    } catch (error) {
      return done(error._stack);
    }
  }),
);

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  'jwt',
  new JWTStrategy(JWTConfig, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload._id);
      if (!user) {
        return done(null, false, { message: 'invalid authorization request' });
      }
      return done(null, user);
    } catch (error) {
      return done(error._stack);
    }
  }),
);

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SITE_DOMAIN}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, 'google', profile._json);
      } catch (error) {
        return done(error._stack);
      }
    },
  ),
);

passport.use(
  'line',
  new LineStrategy(
    {
      channelID: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackURL: `${process.env.SITE_DOMAIN}/auth/line/callback`,
      scope: ['profile', 'openid', 'email'],
      botPrompt: 'normal',
      uiLocales: 'ja-JP',
    },
    async (accessToken, refreshToken, params, _, done) => {
      try {
        const profile = jwt.decode(params.id_token);
        return done(null, 'line', profile);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  'github',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SITE_DOMAIN}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, 'github', profile._json);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
