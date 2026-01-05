const axios = require('axios');
const zpConfig = require('../config/zalopay');
const ShippingAddress = require('../models/shippingaddress');
const Order = require('../models/order');

class ZaloPayService {

    static async createOrder(amount, postalCode) {
        try {
            if (!amount || amount <= 0) throw new Error('Invalid amount');
            if (!postalCode) throw new Error('Missing postal code');
            if (!zpConfig.app_id || !zpConfig.key1) {
                throw new Error('ZaloPay not configured');
            }

            const appTransId = this.generateAppTransId();
            const items = [{
                itemid: "ECOMMERCE",
                itemname: "Thanh toán đơn hàng",
                itemprice: Math.round(amount),
                itemquantity: 1
            }];

            const order = {
                app_id: zpConfig.app_id,
                app_user: `user_${Date.now()}`,
                app_trans_id: appTransId,
                app_time: Date.now(),
                amount: Math.round(amount),
                item: JSON.stringify(items),
                embed_data: JSON.stringify({
                    redirecturl: `${process.env.CLIENT_URL}/he-thong/successful/${postalCode}`,
                    postalcode: postalCode
                }),
                description: `Order #${postalCode}`,
                bank_code: "",
                callback_url: `${process.env.SERVER_URL}/api/v1/payment/zalopay-callback`
            };

            const macData = [
                order.app_id,
                order.app_trans_id,
                order.app_user,
                order.amount,
                order.app_time,
                order.embed_data,
                order.item
            ].join('|');
            
            order.mac = zpConfig.generateMAC(macData, 1);

            const response = await axios.post(`${zpConfig.endpoint}/create`, order, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.return_code === 1) {
                await ShippingAddress.findOneAndUpdate(
                    { postalCode },
                    { 
                        sessionId: appTransId,
                        zalopayAppTransId: appTransId,
                        status: 'pending'
                    }
                );

                return {
                    success: true,
                    order_url: response.data.order_url,
                    app_trans_id: appTransId,
                    zp_trans_token: response.data.zp_trans_token
                };
            } else {
                throw new Error(response.data.return_message || 'Create order failed');
            }

        } catch (error) {
            console.error('ZaloPay createOrder error:', error.message);
            throw error;
        }
    }

    static async checkStatus(appTransId) {
        try {
            const params = {
                app_id: zpConfig.app_id,
                app_trans_id: appTransId,
                mac: ""
            };

            const macData = [params.app_id, params.app_trans_id, zpConfig.key1].join('|');
            params.mac = zpConfig.generateMAC(macData, 1);

            const response = await axios.post(`${zpConfig.endpoint}/query`, params, {
                timeout: 15000
            });

            return {
                status: response.data.return_code === 1 ? 'success' : 'failed',
                message: response.data.return_message,
                data: response.data
            };

        } catch (error) {
            console.error('Check status error:', error.message);
            throw error;
        }
    }

    static async refund(postalCode) {
        try {

            const shipping = await ShippingAddress.findOne({ postalCode });
            if (!shipping || !shipping.zalopayAppTransId) {
                throw new Error('Order not found');
            }

            const order = await Order.findOne({ postalCode, status: 'Order Successful' });
            if (!order) throw new Error('Order not found');

            const refundAmount = Math.round(order.totalAmount * 0.9);
            const mRefundId = `REFUND_${postalCode}_${Date.now()}`;

            const params = {
                app_id: zpConfig.app_id,
                zp_trans_id: shipping.zalopayAppTransId,
                m_refund_id: mRefundId,
                amount: refundAmount,
                timestamp: Date.now(),
                description: `Refund order ${postalCode}`,
                mac: ""
            };

            const macData = [
                params.app_id,
                params.zp_trans_id,
                params.amount,
                params.description,
                params.timestamp
            ].join('|');
            
            params.mac = zpConfig.generateMAC(macData, 2);

            const response = await axios.post(`${zpConfig.endpoint}/refund`, params, {
                timeout: 30000
            });

            if (response.data.return_code === 1) {
                // Cập nhật DB
                await ShippingAddress.updateOne(
                    { postalCode },
                    { status: 'Cancel', refundId: mRefundId }
                );

                await Order.updateMany(
                    { postalCode },
                    { status: 'Cancel' }
                );

                return {
                    success: true,
                    refund_id: response.data.refund_id,
                    amount: refundAmount
                };
            } else {
                throw new Error(response.data.return_message || 'Refund failed');
            }

        } catch (error) {
            console.error('Refund error:', error.message);
            throw error;
        }
    }

    static async handleCallback(data, mac) {
        try {

            if (!zpConfig.verifyCallback(data, mac)) {
                throw new Error('Invalid MAC');
            }

            const callbackData = JSON.parse(data);

            const shipping = await ShippingAddress.findOne({
                zalopayAppTransId: callbackData.app_trans_id
            });

            if (!shipping) {
                console.warn('Order not found:', callbackData.app_trans_id);
                return { return_code: 1 };
            }

            if (callbackData.return_code === 1) {
                await ShippingAddress.updateOne(
                    { _id: shipping._id },
                    { status: 'Order Successful' }
                );

                await Order.updateMany(
                    { postalCode: shipping.postalCode },
                    { status: 'Order Successful' }
                );
            }

            return { return_code: 1, return_message: 'success' };

        } catch (error) {
            console.error('Callback error:', error.message);
            return { return_code: -1, return_message: error.message };
        }
    }

    static generateAppTransId() {
        const date = new Date();
        const yymmdd = date.getFullYear().toString().slice(-2) + 
                      String(date.getMonth() + 1).padStart(2, '0') + 
                      String(date.getDate()).padStart(2, '0');
        return `${yymmdd}_${Date.now()}`;
    }
}

module.exports = ZaloPayService;