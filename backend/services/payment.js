import { response } from "express";
import db from '../models'

const stripe = require("../config/stripe");

export const createCheckoutSession = (total) =>new Promise(async (resolve, reject) => {
    const {amount,id } = total
    try {
        const response = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: "WEB_SHOPPING",
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/he-thong/successful/${id}`,
            cancel_url: `${process.env.CLIENT_URL}/he-thong/cancel`,
        });
        const existingRecord = await db.ShippingAddress.findOne({
                where: { postalCode: id },
              });
        
        if (existingRecord) {
        await existingRecord.update({
            sessionId: response.id,
            status: 'Order Successful'
         });
        }
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Failed.',
            response 
        })
    } catch (error) {
        reject(error)
    }
}) 
export const exportPayments = async (req, res) =>new Promise(async(resolve, reject) => {
    
    try {
        const payments = await stripe.paymentIntents.list({
            limit: 100, // Số giao dịch muốn lấy (tối đa 100)
        });
        // Tạo file CSV từ danh sách giao dịch
        const response = payments.data.map((payment) => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency.toUpperCase(),
            status: payment.status,
            description: payment.description,
            created: new Date(payment.created * 1000).toISOString(),
        }))
        resolve({
            err : response? 0 : 1,
            msg: response? 'OK' : 'Failed',
            response
        })
    } catch (error) {
        reject(error)
    }
})
//sửa lại .... => ko dùng
export const getPaymentIdServices = (sessionId) =>new Promise(async (resolve, reject) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentIntentId = session.payment_intent;
        console.log(paymentIntentId)
        resolve({
            err : paymentIntentId? 0 : 1,
            msg: paymentIntentId? 'OK' : 'Failed',
            paymentIntentId
        })
    } catch (error) {
        reject(error)
    }
})

export const PostRefundPayment = (postalCode) => new Promise(async(resolve, reject) => {
    try {
        const sessionId = await db.ShippingAddress.findOne({
            where: {postalCode: postalCode}
        })
        await db.ShippingAddress.update(
            { status: 'Cancel' },
            {
                where: {postalCode: postalCode}
            },
        )
        await db.Order.update(
            { status: 'Cancel' },
            {
                where: {postalCode: postalCode}
            },
        )
        const session = await stripe.checkout.sessions.retrieve(sessionId.sessionId)
        const paymentIntentId = session.payment_intent
        const refundAmount = Math.floor(session.amount_total * 0.9)
        const response = await  stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount
          });
        
        resolve({
            err : response? 0 : 1,
            msg: response? 'OK' : 'Failed',
        })
    } catch (error) {
        reject(error)
    }
})