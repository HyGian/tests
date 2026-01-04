const authService = require('../services/auth');

const register = async (req, res, next) => {
    const { name, phone, password } = req.body;
    try {
        if (!name || !phone || !password) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing inputs!'
            });
        }
        const response = await authService.registerService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error); // Bây giờ next đã tồn tại
    }
};

const login = async (req, res, next) => {
    const { phone, password } = req.body;
    try {
        if (!phone || !password) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing inputs!'
            });
        }
        const response = await authService.loginService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };