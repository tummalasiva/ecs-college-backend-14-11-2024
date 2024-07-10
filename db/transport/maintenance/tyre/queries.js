const Tyre = require("./model");

module.exports = class TyreData {
  static async create(data) {
    try {
      const result = await new Tyre(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Tyre.findOne(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Tyre.find(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      return await Tyre.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      return await Tyre.findOneAndUpdate(filter, data, options)
        .populate("vehicle firm")
        .lean();
    } catch (error) {
      throw error;
    }
  }
};
