import * as services from '../services/payment'

export const checkout = async(req, res) =>{
    const { amount} = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount." });
    }
    try {
        const response = await services.createCheckoutSession( req.body)
        // console.log(response.response.url)
        res.status(200).json(response.response);
    } catch (error) {
        return res.status(500).json({
            err:-1,
            msg: 'Faild at payment controller: '+error
        })
    }
} 
export const exportPayments = async(req, res) =>{
    try {
        const response = await services.exportPayments()
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err:-1,
            msg: 'Faild at payment controller: '+error
        })
    }
} 
export const paymentIntentId = async(req, res) =>{
    const sessionId = req.params.sessionId;

    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required." });
    }
    try {
        const response = await services.getPaymentIdServices(sessionId)
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err:-1,
            msg: 'Faild at payment controller: '+error
        })
    }
} 
export const RefundPayment = async(req, res) =>{
    try {
        const postalCode = req.params.id
        if(!postalCode){
            return res.status(400).json({ error: "Invalid" });
        }
        const response = await services.PostRefundPayment(postalCode)
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err:-1,
            msg: 'Faild at payment controller: '+error
        })
    }
}