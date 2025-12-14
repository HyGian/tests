const Category = require('../models/category');

const getCategoriesSerivce = () => new Promise(async (resolve, reject) => {
    try {
        const categories = await Category.find({
            header: { $in: ['NAM', 'NỮ', 'THÁNG VÀNG SĂN SALE'] }
        })
        .select('code header')
        .sort({ header: 1 });

        resolve({
            err: categories ? 0 : 1,
            msg: categories ? 'OK' : 'Failed to get categories.',
            response: categories
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = { getCategoriesSerivce };