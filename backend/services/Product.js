const Product = require('../models/product');
const Category = require('../models/category');
const { cache } = require('../config/redis');
const mongoose = require('mongoose');

const getProductSerivce = () => new Promise(async (resolve, reject) => {
    try {
        const products = await Product.find({})
            .populate('category', 'header description')
            .sort({ createdAt: -1 });

        resolve({
            err: products ? 0 : 1,
            msg: products ? 'OK' : 'Failed to get products.',
            response: products
        });
    } catch (error) {
        reject(error);
    }
});

const getProductQRSerivce = (query) => new Promise(async (resolve, reject) => {
    try {
        const { sort = 'DESC', color = '', version = '' } = query;
        
        const filter = {};
        const sortOrder = sort === 'ASC' ? 1 : -1;

        if (color || version) {
            filter['info'] = {
                $elemMatch: {}
            };
            if (color) filter['info'].$elemMatch.color = { $regex: color, $options: 'i' };
            if (version) filter['info'].$elemMatch.version = { $regex: version, $options: 'i' };
        }

        const products = await Product.find(filter)
            .populate('category', 'header description')
            .sort({ price: sortOrder });

        resolve({
            err: products ? 0 : 1,
            msg: products ? 'OK' : 'Failed to get products.',
            response: products
        });
    } catch (error) {
        reject(error);
    }
});

const getProductLimitSerivce = (postId) => new Promise(async (resolve, reject) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return resolve({
                err: 1,
                msg: 'Invalid product ID.',
                response: null
            });
        }

        const product = await Product.findById(postId)
            .populate('category', 'header description');

        resolve({
            err: product ? 0 : 1,
            msg: product ? 'OK' : 'Failed to get product.',
            response: product
        });
    } catch (error) {
        reject(error);
    }
});

const getProductSreachService = (query) => new Promise(async (resolve, reject) => {
    try {
        const { category = '', color = '', gender = '' } = query;
        
        const filter = {};

        if (category) {
            filter.name = { $regex: category, $options: 'i' };
        }

        if (color) {
            filter['info.color'] = { $regex: color, $options: 'i' };
        }

        if (gender && gender !== 'other') {
            const categories = await Category.find({
                header: { $regex: gender, $options: 'i' }
            }).select('_id');

            const categoryIds = categories.map(cat => cat._id);
            if (categoryIds.length > 0) {
                filter.category = { $in: categoryIds };
            }
        }

        const products = await Product.find(filter)
            .populate('category', 'header')
            .sort({ createdAt: -1 });

        resolve({
            err: products ? 0 : 1,
            msg: products ? 'OK' : 'Failed to get products.',
            response: products
        });
    } catch (error) {
        reject(error);
    }
});

const createProduct = (data) => new Promise(async (resolve, reject) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

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
        } = data;

        const product = await Product.create([{
            name: productName,
            description: productDescription,
            price: productPrice,
            category: productCategoryId,
            images: [{
                imageUrl: productimageUrl,
                color: productColorUrl
            }],
            info: [{
                information: productInformation,
                color: productColor,
                version: productVersion
            }]
        }], { session });

        await session.commitTransaction();
        
        resolve({
            err: product ? 0 : 1,
            msg: product ? 'Product created successfully!' : 'Failed to create product',
            response: product[0]
        });
    } catch (error) {
        await session.abortTransaction();
        reject(error);
    } finally {
        session.endSession();
    }
});

const DeleteProduct = (products) => new Promise(async (resolve, reject) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        const productIds = products.map(product => product.id);

        const result = await Product.deleteMany(
            { _id: { $in: productIds } },
            { session }
        );

        await session.commitTransaction();
        
        resolve({
            err: result.deletedCount > 0 ? 0 : 1,
            msg: result.deletedCount > 0 ? 'Products deleted successfully!' : 'Failed to delete products',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        await session.abortTransaction();
        reject(error);
    } finally {
        session.endSession();
    }
});

module.exports = {
    getProductSerivce,
    getProductQRSerivce,
    getProductLimitSerivce,
    getProductSreachService,
    createProduct,
    DeleteProduct
};