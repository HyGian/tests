const productService = require('../services/Product');

const getProduct = async (req, res) => {
    try {
        const response = await productService.getProductSerivce();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

const getProductQR = async (req, res) => {
    try {
        const { ...query } = req.query;
        const response = await productService.getProductQRSerivce(query);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

const getProductLimit = async (req, res) => {
    try {
        const { postId } = req.params;
        
        if (!postId) {
            return res.status(400).json({
                err: 1,
                msg: 'postId is required'
            });
        }
        
        const response = await productService.getProductLimitSerivce(postId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

const getProductSreach = async (req, res) => {
    try {
        const response = await productService.getProductSreachService(req.query);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

const PostCreatePorduct = async (req, res) => {
    const {
        productName,
        productDescription,
        productPrice,
        productCategoryId,
        productimageUrl,
        productColorUrl,
        productInformation,
        productColor,
        productVersion
    } = req.body;
    
    if (!productName || !productDescription || !productPrice || !productCategoryId || !productimageUrl
        || !productColorUrl || !productInformation || !productColor || !productVersion) {
        return res.status(400).json({
            err: 1,
            msg: 'Missing required product information'
        });
    }
    
    try {
        const response = await productService.createProduct(req.body);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

const PostDeleteProduct = async (req, res) => {
    const products = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
            err: 1,
            msg: 'Products array is required'
        });
    }
    
    try {
        const response = await productService.DeleteProduct(products);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at product controller: ' + error.message
        });
    }
};

module.exports = {
    getProduct,
    getProductQR,
    getProductLimit,
    getProductSreach,
    PostCreatePorduct,
    PostDeleteProduct
};