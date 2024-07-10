const Greecing = require("./model");

module.exports = class GreecingData {
  static async create(data) {
    try {
      const result = await new Greecing(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Greecing.findOne(filter, projection)
        .populate("vehicle")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Greecing.find(filter, projection)
        .populate("vehicle")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      return await Greecing.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      return await Greecing.findOneAndUpdate(filter, data, options)
        .populate("vehicle")
        .lean();
    } catch (error) {
      throw error;
    }
  }
};
