const userService = require('../services/user');

const updateUserController = async (req, res) => {
    const { id } = req.user;
    const payload = req.body;
    
    try {
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing payload'
            });
        }
        
        const response = await userService.updateuser(payload, id);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at user controller: ' + error.message
        });
    }
};

const getContactcontroller = async (req, res) => {
    const { id } = req.user;
    const payload = req.body;
    
    try {
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing payload'
            });
        }
        
        const response = await userService.getContact(payload, id);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at user controller: ' + error.message
        });
    }
};

const getCurrent = async (req, res) => {
    const { id } = req.user;
    
    try {
        const response = await userService.getOne(id);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at user controller: ' + error.message
        });
    }
};

module.exports = {
    updateUserController,
    getContactcontroller,
    getCurrent
};