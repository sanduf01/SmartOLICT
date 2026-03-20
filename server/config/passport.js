const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();

        // ⛔ Passport does NOT touch DB
        // ⛔ Passport does NOT create users
        // ⛔ Passport does NOT decide register/login

        return done(null, {
          email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          googleId: profile.id
        });

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;

