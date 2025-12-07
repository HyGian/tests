import db from '../models'

//GET ALL CATEGORY
export const getCategoriesSerivce = () => new Promise(async (resolve, reject) => {
    try {
        const response = await db.Category.findAll({
            raw: true,
            //attributes: { exclude: ['description', 'createdAt', 'updatedAt'] } remove attributes 
            attributes:['code', 'header'],
            where: {header:['NAM', 'NỮ','THÁNG VÀNG SĂN SALE']}
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'OK' : 'Failed to get categories.',
            response
        })
    } catch (error) {
        reject(error)
    }
})