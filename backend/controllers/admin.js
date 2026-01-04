const adminService = require('../services/admin');

const login = async (req, res, next) => {
    const { phone, password } = req.body;
    try {
        if (!phone || !password) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing inputs!'
            });
        }

        const response = await adminService.loginService(req.body);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Fail at admin controller: ' + error.message
        });
    }
};

const InfoUser = async (req, res, next) => {
    try {
        const response = await adminService.InfoUser();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at admin controller: ' + error.message
        });
    }
};

const GetproductAdmin = async (req, res, next) => {
    try {
        const response = await adminService.GetproductServiceAdmin();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at admin controller: ' + error.message
        });
    }
};

const getOrderAdmin = async (req, res, next) => {
    try {
        const response = await adminService.getOrderAdminService();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at admin controller: ' + error.message
        });
    }
};


const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                err: 1,
                msg: 'Status is required'
            });
        }

        const response = await adminService.updateOrderStatus(orderId, status);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at admin controller: ' + error.message
        });
    }
};

module.exports = {
    login,
    InfoUser,
    GetproductAdmin,
    getOrderAdmin,
    updateOrderStatus
};