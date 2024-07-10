const FeeMapCategory = require("./model");

module.exports = class FeeMapCategoryClass {
  static async create(data) {
    try {
      const result = await new FeeMapCategory(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}, projection) {
    try {
      const result = await FeeMapCategory.findOne(filter, projection)
        .populate("school feeMap")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await FeeMapCategory.find(filter, projection)
        .populate("school feeMap")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      const result = await FeeMapCategory.findOneAndUpdate(
        filter,
        data,
        options
      )
        .populate("school feeMap")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateMany(filter, data, options = {}) {
    try {
      const result = await FeeMapCategory.updateMany(filter, data, options);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await FeeMapCategory.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMany(filter) {
    try {
      const result = await FeeMapCategory.deleteMany(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
