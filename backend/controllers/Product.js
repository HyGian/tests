import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/product.js"
import { redisClient } from "../config/redis.js"; 

const clearProductCache = async () => {
    try {
        await redisClient.del('products_list');
    } catch (error) {
        console.error("Redis Clear Cache Error:", error);
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save();

        // XÓA CACHE sau khi thêm sản phẩm mới
        await clearProductCache();

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

const listProducts = async (req, res) => {
    try {
        const cacheKey = 'products_list';

        // 1. Kiểm tra dữ liệu trong Redis
        const cachedProducts = await redisClient.get(cacheKey);
        if (cachedProducts) {
            return res.json({ success: true, products: JSON.parse(cachedProducts), source: 'redis' });
        }

        const products = await productModel.find({});

        // 3. Lưu vào Redis thời gian  là 1 h
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));

        res.json({ success: true, products, source: 'database' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        await productModel.findByIdAndDelete(req.body.id);

        // XÓA CACHE sau khi xóa sản phẩm
        await clearProductCache();

        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body

        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (subCategory) updateData.subCategory = subCategory;
        if (sizes) updateData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        if (bestseller !== undefined) updateData.bestseller = bestseller === "true" || bestseller === true;

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        await clearProductCache();

        res.json({ success: true, message: "Product Updated", product: updatedProduct });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const restockProduct = async (req, res) => {
    try {
        const { productId, sizes } = req.body;

        if (!productId || !sizes) {
            return res.status(400).json({ success: false, message: "Product ID and sizes are required" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

        for (const newSize of parsedSizes) {
            const existingSize = product.sizes.find(s => s.size === newSize.size);
            if (existingSize) {
                existingSize.quantity += newSize.quantity;
            } else {
                product.sizes.push(newSize);
            }
        }

        await product.save();

 
        await clearProductCache();

        res.json({ success: true, message: "Stock Added Successfully", product });
    } catch (error) {
        console.error("Restock Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct, restockProduct }