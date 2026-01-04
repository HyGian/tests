const passport = require('passport');

const googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});

const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, data) => {
        if (err || !data) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
        }
        res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${data.token}&user=${JSON.stringify(data.user)}`);
    })(req, res, next);
};

const facebookLogin = passport.authenticate('facebook', {
    scope: ['email'],
    session: false
});

const facebookCallback = (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, data) => {
        if (err || !data) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=facebook_auth_failed`);
        }
        res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${data.token}&user=${JSON.stringify(data.user)}`);
    })(req, res, next);
};

const linkGoogle = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = req.user;

        return res.status(200).json({
            err: 0,
            msg: 'Google account linked successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed to link Google account: ' + error.message
        });
    }
};

const linkFacebook = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = req.user;

        return res.status(200).json({
            err: 0,
            msg: 'Facebook account linked successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed to link Facebook account: ' + error.message
        });
    }
};

module.exports = {
    googleLogin,
    googleCallback,
    facebookLogin,
    facebookCallback,
    linkGoogle,
    linkFacebook
};