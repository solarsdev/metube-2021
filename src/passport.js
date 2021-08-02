import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import bcrypt from 'bcrypt';
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
        return done(null, false, { message: 'Email/Password is wrong' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Email/Password is wrong' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
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
      return done(error);
    }
  }),
);
