const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [
                { email: profile.emails[0].value },
                { googleId: profile.id }
            ]
        });

        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                phone: '', 
                password: Math.random().toString(36).slice(-8), 
                isVerified: true,
                avatar: profile.photos[0].value
            });
            await user.save();
        } else {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '2d' }
        );

        return done(null, { user, token });
    } catch (error) {
        return done(error, null);
    }
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email', 'photos'],
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [
                { email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com` },
                { facebookId: profile.id }
            ]
        });

        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
                facebookId: profile.id,
                phone: '', 
                password: Math.random().toString(36).slice(-8), 
                isVerified: true,
                avatar: profile.photos ? profile.photos[0].value : null
            });
            await user.save();
        } else {
            if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '2d' }
        );

        return done(null, { user, token });
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((data, done) => {
    done(null, data.user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;