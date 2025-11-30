'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasOne(models.Product, {
        foreignKey: 'categoryId',
         as: 'products'
    });
    }
  }
  Category.init({
    code: DataTypes.STRING,
    header: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};