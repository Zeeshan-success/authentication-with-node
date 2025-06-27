// auth/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/signUpModel'); // Adjust path to your User model
const bcrypt = require('bcryptjs');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this email
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // User exists, log them in
          console.log('Existing user found:', existingUser.email);
          return done(null, existingUser);
        }

        // Create new user if they don't exist
        const newUser = new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
          isVerified: true, // OAuth users are automatically verified
          googleId: profile.id, // Optional: add googleId field to your schema
        });

        const savedUser = await newUser.save();
        console.log('New user created:', savedUser.email);
        return done(null, savedUser);

      } catch (error) {
        console.error('OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;