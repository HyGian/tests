import categoryModel from "../models/category.js";
import subCategoryModel from "../models/subCategory.js";

// --- CATEGORY ---

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = new categoryModel({ name });
        await category.save();
        res.json({ success: true, message: "Category Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.json({ success: true, categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const removeCategory = async (req, res) => {
    try {
        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Category Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// --- SUB-CATEGORY ---

const addSubCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const subCategory = new subCategoryModel({ name });
        await subCategory.save();
        res.json({ success: true, message: "SubCategory Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find({});
        res.json({ success: true, subCategories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const removeSubCategory = async (req, res) => {
    try {
        await subCategoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "SubCategory Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addCategory, listCategories, removeCategory, addSubCategory, listSubCategories, removeSubCategory };