const Admin = require('../models/admin');

const verifyAdmin = async (req, res, next) => {
    try {
        const user = req.user; 
        
        if (!user) {
            return res.status(401).json({
                err: 1,
                msg: 'Unauthorized'
            });
        }
        const admin = await Admin.findById(user.id);
        
        if (!admin) {
            return res.status(403).json({
                err: 1,
                msg: 'Forbidden: Admin access only'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Admin verification failed: ' + error.message
        });
    }
};

module.exports = verifyAdmin;