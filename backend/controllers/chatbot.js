
import { GoogleGenerativeAI } from "@google/generative-ai";
import productModel from "../models/product.js";
import orderModel from "../models/order.js";

// Simple in-memory session store
const userSessions = {};

const chatWithAI = async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.body.userId; // Provided by auth middleware

        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Gemini API Key is missing in server config" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Prompt Engineering: Force JSON output
        const prompt = `
        Role: You are an intelligent eCommerce intent classifier for a fashion website.
        Task: Analyze the user's Vietnamese query and extract the INTENT and ENTITIES.

        Constraints:
        1. Output MUST be strict JSON format only. No markdown (no \`\`\`json tags), no explanations.
        2. If intent is unclear, return "intent": "UNKNOWN".
        3. Do not Hallucinate data. Only extract what is explicitly or implicitly stated.

        Available Intents:
        - "SEARCH_PRODUCT": When user looks for items generally (e.g., "có áo thun không", "giày nam").
        - "CHECK_STOCK": When user asks about availability/sizes/remaining quantity (e.g., "áo này còn size L không", "còn hàng không").
        - "CHECK_PRICE": When user asks for price (e.g., "giá bao nhiêu", "cái này bao tiền").
        - "CHECK_MY_ORDER": When user asks about their own order status/history (e.g., "đơn hàng của tôi đâu", "bao giờ giao", "kiểm tra đơn vừa đặt").
        - "PAYMENT_INFO": Questions about payment methods, VNPAY, banking.

        JSON Structure:
        {
        "intent": "String", 
        "entities": {
            "product_name": "String or null", 
            "category": "String or null",     
            "size": "String or null",        
            "order_id": "String or null"      
        }
        }

        User Query: "${question}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Gemini Raw Response:", responseText);

        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback
            return res.json({ success: true, response: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau." });
        }

        const { intent, entities } = parsedData;
        const sessionId = userId || req.ip || "unknown_user";

        // --- MEMORY LOGIC START ---

        // 1. If new product mentioned, save to session
        if (entities.product_name) {
            userSessions[sessionId] = {
                product_name: entities.product_name,
                category: entities.category
            };
        }
        // 2. If no product mentioned but we have context, inject it
        else if (userSessions[sessionId]) {
            // Only inject if the intent suggests a follow-up (Stock, Price, Search)
            // and the user is asking about a specific attribute (like size) or just general "it"
            if (["CHECK_STOCK", "CHECK_PRICE", "SEARCH_PRODUCT"].includes(intent)) {
                console.log(`[Memory] Restoring context for ${sessionId}:`, userSessions[sessionId]);
                entities.product_name = userSessions[sessionId].product_name;
                if (!entities.category) entities.category = userSessions[sessionId].category;
            }
        }
        // --- MEMORY LOGIC END ---

        let aiResponse = "";

        // 2. Logic Handling based on Intent
        switch (intent) {
            case "SEARCH_PRODUCT":
                // Logic: Search properties
                const searchFilter = {};
                if (entities.product_name) searchFilter.name = { $regex: entities.product_name, $options: 'i' };
                if (entities.category) searchFilter.category = { $regex: entities.category, $options: 'i' };

                const products = await productModel.find(searchFilter).limit(3);

                if (products.length > 0) {
                    aiResponse = `Mình tìm thấy ${products.length} sản phẩm phù hợp:\n`;
                    products.forEach(p => aiResponse += `- ${p.name}: ${p.price.toLocaleString()}đ\n`);
                } else {
                    aiResponse = "Xin lỗi, mình không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.";
                }
                break;

            case "CHECK_STOCK":
                // Logic: Check specific product stock
                if (!entities.product_name) {
                    aiResponse = "Bạn muốn kiểm tra tồn kho cho sản phẩm nào ạ?";
                } else {
                    const productStock = await productModel.findOne({ name: { $regex: entities.product_name, $options: 'i' } });
                    if (!productStock) {
                        aiResponse = `Mình không tìm thấy sản phẩm "${entities.product_name}". Bạn kiểm tra lại tên nhé.`;
                    } else {
                        if (entities.size) {
                            const sizeInfo = productStock.sizes.find(s => s.size === entities.size.toUpperCase() || s.size === entities.size);
                            if (sizeInfo) {
                                aiResponse = `Sản phẩm "${productStock.name}" size ${entities.size} hiện còn ${sizeInfo.quantity} cái.`;
                            } else {
                                aiResponse = `Sản phẩm "${productStock.name}" không có size ${entities.size}.`;
                            }
                        } else {
                            // List all sizes
                            aiResponse = `Sản phẩm "${productStock.name}" hiện có:\n- Size S: ${getStock(productStock, 'S')}\n- Size M: ${getStock(productStock, 'M')}\n- Size L: ${getStock(productStock, 'L')}\n- Size XL: ${getStock(productStock, 'XL')}\n- Size XXL: ${getStock(productStock, 'XXL')}`;
                        }
                    }
                }
                break;

            case "CHECK_PRICE":
                if (!entities.product_name) {
                    aiResponse = "Bạn muốn hỏi giá sản phẩm nào?";
                } else {
                    const productPrice = await productModel.findOne({ name: { $regex: entities.product_name, $options: 'i' } });
                    if (productPrice) {
                        aiResponse = `Giá của "${productPrice.name}" là ${productPrice.price.toLocaleString()}đ nhé bạn.`;
                    } else {
                        aiResponse = "Không tìm thấy sản phẩm này để báo giá ạ.";
                    }
                }
                break;

            case "CHECK_MY_ORDER":
                if (!userId) {
                    aiResponse = "Bạn cần đăng nhập để kiểm tra đơn hàng ạ.";
                } else {
                    // Get latest order or specific order
                    const orders = await orderModel.find({ userId: userId }).sort({ date: -1 }).limit(1);
                    if (orders.length > 0) {
                        const order = orders[0];
                        const date = new Date(order.date).toLocaleDateString();
                        aiResponse = `Đơn hàng gần nhất của bạn (ngày ${date}) đang ở trạng thái: "${order.status}".\nTổng tiền: ${order.amount.toLocaleString()}đ - Thanh toán: ${order.paymentMethod} (${order.payment ? 'Đã TT' : 'Chưa TT'}).`;
                    } else {
                        aiResponse = "Bạn chưa có đơn hàng nào trong hệ thống.";
                    }
                }
                break;

            case "PAYMENT_INFO":
                aiResponse = "Shop hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán qua VNPAY an toàn, tiện lợi. Bạn có thể chọn phương thức thanh toán ở bước Đặt hàng nhé.";
                break;

            case "UNKNOWN":
            default:
                aiResponse = "Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn có thể hỏi về sản phẩm, giá cả, tồn kho hoặc đơn hàng được không?";
                break;
        }

        res.json({ success: true, response: aiResponse, intent: intent });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Helper to get stock safely
const getStock = (product, size) => {
    const s = product.sizes.find(x => x.size === size);
    return s ? s.quantity : 0;
}

export { chatWithAI };