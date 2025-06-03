import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';


export const setupGoogleStrategy = () => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ 
          where: { 'contact_info.email': profile.emails?.[0].value } 
        });

        if (!user) {
          // Create new user if doesn't exist
          const hashedPassword = await bcrypt.hash(profile.id + Date.now(), 10);
          user = await User.create({
              user_id: uuidv4(),
              username: profile.emails?.[0].value?.split('@')[0] || `user_${Date.now()}`,
              name: profile.displayName,
              role: 'user', // Default role
              contact_info: {
                  email: profile.emails?.[0].value,
                  name: profile.displayName,
                  picture: profile.photos?.[0].value
              },
              password: hashedPassword,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              login_url: '',
              utility_id: ''
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  ));
};

function uuidv4(): string {
    return uuidv4();
}
