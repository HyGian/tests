const orderService = require('../services/Order');

const postOrder = async (req, res, next) => {
    const { id } = req.user;
    if (!id) {
        return res.status(401).json({
            err: -3,
            msg: 'Unauthorized: Missing user ID',
        });
    }
    
    const { ...formData } = req.body;
    try {
        const response = await orderService.postOrderService(formData, id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const getOrder = async (req, res, next) => {
    const { id } = req.user;
    if (!id) {
        return res.status(401).json({
            err: -3,
            msg: 'Unauthorized: Missing user ID',
        });
    }
    
    try {
        const response = await orderService.getOrderService(id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const UpdateOrder = async (req, res, next) => {
    try {
        const { orderItemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity) {
            return res.status(400).json({
                err: -1,
                msg: 'Quantity is required'
            });
        }
        
        const response = await orderService.updateOrderService(quantity, orderItemId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const DeleteOrder = async (req, res, next) => {
    try {
        const { orderitemsId } = req.params;
        const response = await orderService.deleteOrderService(orderitemsId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const ShippingAdress = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            err: -1,
            msg: 'Postal code is required'
        });
    }
    
    try {
        const response = await orderService.getShippingAdressService(id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const putOrderUser = async (req, res, next) => {
    const postalCode = req.params.id;
    const { id } = req.user;
    
    if (!id || !postalCode) {
        return res.status(400).json({
            err: -1,
            msg: 'User ID and postal code are required'
        });
    }
    
    try {
        const response = await orderService.putOrderUser(id, postalCode);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

const InfoOrderSuccessful = async (req, res, next) => {
    const { id } = req.user;
    if (!id) {
        return res.status(401).json({
            err: -3,
            msg: 'Unauthorized: Missing user ID',
        });
    }
    
    try {
        const response = await orderService.getInfoOrderSuccessful(id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at Order controller: ' + error.message
        });
    }
};

module.exports = {
    postOrder,
    getOrder,
    UpdateOrder,
    DeleteOrder,
    ShippingAdress,
    putOrderUser,
    InfoOrderSuccessful
};