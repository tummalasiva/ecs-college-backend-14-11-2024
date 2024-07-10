const Fuel = require("./model");

module.exports = class FuelData {
  static async create(data) {
    try {
      const result = await new Fuel(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Fuel.findOne(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Fuel.find(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      return await Fuel.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      return await Fuel.findOneAndUpdate(filter, data, options)
        .populate("vehicle firm")
        .lean();
    } catch (error) {
      throw error;
    }
  }
};
