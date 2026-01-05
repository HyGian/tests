
import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import orderModel from '../models/order.js';


export const createPaymentUrl = async (req, res) => {
    try {
        const { amount, orderInfo, returnUrl } = req.body;

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        // Use environment variables for sensitive data
        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;

        // Fallback to Sandbox if envs are missing (FOR TESTING ONLY)
        if (!tmnCode || !secretKey || !vnpUrl) {
            console.warn("VNPay environment variables missing. Using SANDBOX default values for testing.");
            tmnCode = "4JLF9A6F"; // Example Sandbox TmnCode
            secretKey = "OJC7198ZDPMCBMJTNJIL7LOWRRV1WOX6"; 
            vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        }

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderInfo; // Using Order ID as TxnRef
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay amount is in smallest unit
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({ success: true, paymentUrl: vnpUrl });

    } catch (error) {
        console.error("Create Payment URL Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let secretKey = process.env.VNP_HASH_SECRET;
        if (!secretKey) {
            console.warn("VNPay environment variables missing. Using SANDBOX default values for testing.");
            secretKey = "A3EFDFABA8674989631D521D17E34BE1";
        }

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            // Checksum match
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            // Validate response code: 00 = Success
            if (rspCode === '00') {
                // Update order status to PAID
                const order = await orderModel.findById(orderId);
                if (order) {
                    order.payment = true;
                    order.paymentMethod = "VNPay";
                    await order.save();
                }
                res.status(200).json({ success: true, message: "Payment successful" });
            } else {
                res.status(200).json({ success: false, message: "Payment failed" });
            }
        } else {
            res.status(200).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("VNPay Return Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}


function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = obj[str[key]] ? encodeURIComponent(obj[str[key]]).replace(/%20/g, "+") : "";
    }
    return sorted;
}